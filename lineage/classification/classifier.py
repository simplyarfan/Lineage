"""
watsonx.ai session classifier for domain and risk tier classification.

Uses IBM Granite-3-8b-instruct model to classify AI coding sessions
for EU AI Act compliance and risk assessment.
"""
import json
import re
import time
import requests
from typing import Dict, Optional
from datetime import datetime, timedelta


class SessionClassifier:
    """
    Classifies AI sessions using watsonx.ai Granite model.
    
    Converts raw session metadata into domain labels and risk tiers
    for the Risk Lens feature in Lineage UI.
    """
    
    def __init__(self, api_key: str, project_id: str, endpoint: str):
        """
        Initialize with watsonx.ai credentials.
        
        Args:
            api_key: IBM Cloud API key
            project_id: watsonx.ai project ID
            endpoint: watsonx.ai endpoint URL
        """
        self.api_key = api_key
        self.project_id = project_id
        self.endpoint = endpoint.rstrip('/')
        
        # Token caching
        self._iam_token = None
        self._token_expires_at = None
        
        # Rate limiting
        self._last_request_time = 0
        self._rate_limit_delay = 0.5  # 500ms between requests
    
    def _get_iam_token(self) -> str:
        """
        Get IBM Cloud IAM token for API authentication.
        
        Caches token and refreshes when expired (3600s lifetime).
        
        Returns:
            str: Bearer token for API calls
            
        Raises:
            requests.RequestException: If token request fails
        """
        # Check if cached token is still valid
        if (self._iam_token and self._token_expires_at and 
            datetime.now() < self._token_expires_at):
            return self._iam_token
        
        # Request new token
        token_url = "https://iam.cloud.ibm.com/identity/token"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        }
        data = {
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": self.api_key
        }
        
        response = requests.post(token_url, headers=headers, data=data, timeout=30)
        response.raise_for_status()
        
        token_data = response.json()
        self._iam_token = token_data["access_token"]
        
        # Cache expiration (subtract 5 minutes for safety)
        expires_in = token_data.get("expires_in", 3600)
        self._token_expires_at = datetime.now() + timedelta(seconds=expires_in - 300)
        
        return self._iam_token
    
    def _rate_limit(self):
        """Apply rate limiting between requests."""
        current_time = time.time()
        time_since_last = current_time - self._last_request_time
        
        if time_since_last < self._rate_limit_delay:
            sleep_time = self._rate_limit_delay - time_since_last
            time.sleep(sleep_time)
        
        self._last_request_time = time.time()
    
    def _build_prompt(self, session) -> str:
        """
        Build classification prompt for the session.
        
        Args:
            session: Session object with metadata
            
        Returns:
            str: Formatted prompt for Granite model
        """
        # Truncate prompt text to 500 chars
        prompt_text = session.prompt_text or "No prompt available"
        if len(prompt_text) > 500:
            prompt_text = prompt_text[:500] + "..."
        
        # Format files modified
        files_modified = session.files_modified or []
        files_str = ", ".join(files_modified) if files_modified else "No files specified"
        
        prompt = f"""Classify this AI coding session for audit purposes.

Session prompt: {prompt_text}
Files modified: {files_str}

Return ONLY a JSON object with these exact fields:
{{"domain": "<one of: auth, payments, data, ui, infra, other>",
 "risk_tier": "<one of: high, medium, low>",
 "rationale": "<one sentence>"}}"""
        
        return prompt
    
    def _parse_response(self, response_text: str) -> Dict[str, str]:
        """
        Parse watsonx.ai response to extract classification JSON.
        
        Args:
            response_text: Raw response from Granite model
            
        Returns:
            dict: Classification with domain, risk_tier, rationale
        """
        # Default classification for parsing failures
        default = {
            "domain": "other",
            "risk_tier": "medium", 
            "rationale": "Classification failed - using default"
        }
        
        try:
            # Find JSON object in response (may have surrounding text)
            json_match = re.search(r'\{[^}]*\}', response_text)
            if not json_match:
                return default
            
            json_str = json_match.group(0)
            classification = json.loads(json_str)
            
            # Validate required fields
            required_fields = ["domain", "risk_tier", "rationale"]
            if not all(field in classification for field in required_fields):
                return default
            
            # Validate domain values
            valid_domains = ["auth", "payments", "data", "ui", "infra", "other"]
            if classification["domain"] not in valid_domains:
                classification["domain"] = "other"
            
            # Validate risk tier values
            valid_risks = ["high", "medium", "low"]
            if classification["risk_tier"] not in valid_risks:
                classification["risk_tier"] = "medium"
            
            return classification
            
        except (json.JSONDecodeError, KeyError, AttributeError):
            return default
    
    def classify(self, session) -> Dict[str, str]:
        """
        Classify a session using watsonx.ai Granite model.
        
        Args:
            session: Session object to classify
            
        Returns:
            dict: Classification with domain, risk_tier, rationale
        """
        # Apply rate limiting
        self._rate_limit()
        
        # Build request
        prompt = self._build_prompt(session)
        url = f"{self.endpoint}/ml/v1/text/generation?version=2023-05-29"
        
        headers = {
            "Authorization": f"Bearer {self._get_iam_token()}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model_id": "ibm/granite-3-8b-instruct",
            "project_id": self.project_id,
            "input": prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 200,
                "stop_sequences": ["}"]
            }
        }
        
        # Retry logic with exponential backoff
        max_retries = 3
        retry_delays = [1, 2, 4]  # seconds
        
        for attempt in range(max_retries):
            try:
                response = requests.post(url, headers=headers, json=payload, timeout=30)
                response.raise_for_status()
                
                # Extract generated text
                response_data = response.json()
                generated_text = response_data["results"][0]["generated_text"]
                
                # Parse classification
                return self._parse_response(generated_text)
                
            except (requests.RequestException, KeyError, IndexError) as e:
                if attempt < max_retries - 1:
                    # Wait before retry
                    time.sleep(retry_delays[attempt])
                    continue
        
        # All retries failed - return default classification
        return {
            "domain": "other",
            "risk_tier": "medium",
            "rationale": f"Classification failed after {max_retries} attempts - using default"
        }

# Made with Bob
