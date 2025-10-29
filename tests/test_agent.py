"""Tests for G1 Agent."""

import pytest
from src.agent import G1Agent


def test_agent_initialization():
    """Test that agent initializes correctly."""
    agent = G1Agent()
    assert agent.model is not None
    assert agent.temperature > 0
    assert agent.max_tokens > 0


def test_agent_run():
    """Test basic agent execution."""
    agent = G1Agent()
    result = agent.run("Test prompt")
    assert isinstance(result, str)
    assert len(result) > 0


def test_agent_with_custom_config():
    """Test agent with custom configuration."""
    agent = G1Agent(model="gpt-4", temperature=0.5, max_tokens=1000)
    assert agent.model == "gpt-4"
    assert agent.temperature == 0.5
    assert agent.max_tokens == 1000
