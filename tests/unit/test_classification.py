"""
Unit tests for classification module.
"""
import pytest
from lineage.classification.classifier import SessionClassifier


def test_parse_classification_response():
    """Test parsing of watsonx.ai response containing JSON."""
    classifier = SessionClassifier("fake_key", "fake_project", "https://fake.endpoint")
    
    # Test valid JSON response
    response_text = '''Here is the classification:
    {"domain": "auth", "risk_tier": "high", "rationale": "Authentication code requires security review"}
    '''
    
    result = classifier._parse_response(response_text)
    
    assert result["domain"] == "auth"
    assert result["risk_tier"] == "high"
    assert result["rationale"] == "Authentication code requires security review"


def test_parse_classification_response_with_noise():
    """Test parsing response with surrounding text."""
    classifier = SessionClassifier("fake_key", "fake_project", "https://fake.endpoint")
    
    response_text = '''Based on the session details, I classify this as:
    {"domain": "infra", "risk_tier": "medium", "rationale": "Infrastructure changes need review"}
    This classification is based on the files modified.'''
    
    result = classifier._parse_response(response_text)
    
    assert result["domain"] == "infra"
    assert result["risk_tier"] == "medium"


def test_parse_classification_response_invalid():
    """Test parsing invalid response returns default."""
    classifier = SessionClassifier("fake_key", "fake_project", "https://fake.endpoint")
    
    # No JSON in response
    response_text = "This is not a valid JSON response"
    result = classifier._parse_response(response_text)
    
    assert result["domain"] == "other"
    assert result["risk_tier"] == "medium"
    assert "failed" in result["rationale"].lower()


def test_parse_classification_response_invalid_domain():
    """Test parsing response with invalid domain value."""
    classifier = SessionClassifier("fake_key", "fake_project", "https://fake.endpoint")
    
    response_text = '{"domain": "invalid_domain", "risk_tier": "high", "rationale": "Test"}'
    result = classifier._parse_response(response_text)
    
    # Invalid domain should be normalized to "other"
    assert result["domain"] == "other"
    assert result["risk_tier"] == "high"


def test_parse_classification_response_invalid_risk():
    """Test parsing response with invalid risk tier."""
    classifier = SessionClassifier("fake_key", "fake_project", "https://fake.endpoint")
    
    response_text = '{"domain": "auth", "risk_tier": "critical", "rationale": "Test"}'
    result = classifier._parse_response(response_text)
    
    # Invalid risk tier should be normalized to "medium"
    assert result["domain"] == "auth"
    assert result["risk_tier"] == "medium"


def test_parse_classification_response_missing_fields():
    """Test parsing response with missing required fields."""
    classifier = SessionClassifier("fake_key", "fake_project", "https://fake.endpoint")
    
    response_text = '{"domain": "auth", "risk_tier": "high"}'  # Missing rationale
    result = classifier._parse_response(response_text)
    
    # Should return default classification
    assert result["domain"] == "other"
    assert result["risk_tier"] == "medium"
    assert "failed" in result["rationale"].lower()

# Made with Bob
