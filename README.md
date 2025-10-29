# G1 Agent

A sophisticated AI agent implementation with advanced reasoning capabilities.

## Features

- Multi-model support (OpenAI, Anthropic)
- Configurable agent behavior
- Extensible architecture
- Comprehensive logging
- Type-safe implementation

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

## Usage

```python
from src.agent import G1Agent

agent = G1Agent()
response = agent.run("Your prompt here")
print(response)
```

## Development

Run tests:
```bash
pytest
```

Run linting:
```bash
ruff check .
black --check .
```

Run type checking:
```bash
mypy src/
```

## Project Structure

```
g1-agent/
├── src/           # Source code
├── tests/         # Test files
├── config/        # Configuration files
├── requirements.txt
└── README.md
```

## License

MIT
