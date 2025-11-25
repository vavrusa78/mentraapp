# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

G1 Agent is an AI agent implementation with advanced reasoning capabilities. The project supports multiple LLM backends (OpenAI, Anthropic) and provides a configurable, extensible architecture.

## Development Commands

### Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### Testing
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_agent.py

# Run with coverage
pytest --cov=src tests/

# Run specific test function
pytest tests/test_agent.py::test_agent_initialization
```

### Code Quality
```bash
# Lint code (check only)
ruff check .

# Auto-fix linting issues
ruff check --fix .

# Format code (check only)
black --check .

# Format code (apply)
black .

# Type check
mypy src/
```

## Architecture

### Core Components

- **G1Agent** (`src/agent.py`): Main agent class that handles LLM interaction, configuration, and tool management
  - Configurable via environment variables or constructor parameters
  - Supports model selection, temperature, and max_tokens configuration
  - Includes logging using loguru (logs written to `logs/agent.log`)
  - Designed for tool integration via `add_tool()` method (not yet implemented)

### Configuration

The agent is configured through environment variables (see `.env.example`):
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`: API credentials
- `AGENT_MODEL`: Model selection (default: gpt-4)
- `AGENT_TEMPERATURE`: Generation temperature (default: 0.7)
- `AGENT_MAX_TOKENS`: Max response tokens (default: 2000)
- `LOG_LEVEL`: Logging verbosity (default: INFO)

### Code Standards

- Python 3.11 target
- Line length: 100 characters (enforced by black and ruff)
- Type hints encouraged but not strictly enforced
- Comprehensive docstrings for classes and methods

### Current State

The project is in early development:
- Core agent structure is defined but LLM integration is stubbed (see TODOs in `src/agent.py`)
- Tool management framework exists but needs implementation
- Basic test coverage for initialization and execution flow
