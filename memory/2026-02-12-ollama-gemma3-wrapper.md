# Ollama gemma3:12b Wrapper Scripts - 2026-02-12

Created wrapper scripts to work around CLI interactive mode issues with gemma3:12b on M4 Mac mini.

## Problem Summary
- Interactive CLI mode (`ollama run gemma3:12b`) hangs due to terminal control sequence conflicts
- API mode works perfectly ✓
- Piped input works perfectly ✓
- MLX error is just a warning, doesn't affect functionality

## Scripts Created

### 1. Basic Wrapper (ollama-chat.sh)
Simple interactive chat interface using API.
```bash
./ollama-chat.sh
```
Features:
- Interactive chat loop
- Conversation memory
- Exit with 'exit' or 'quit'
- Clear history with '/clear'

### 2. Advanced Wrapper (ollama-chat-advanced.sh)
Full-featured chat interface.
```bash
# Basic usage
./ollama-chat-advanced.sh

# With options
./ollama-chat-advanced.sh -m gemma3:4b -t 0.5 -s "You are a helpful coding assistant"
```
Features:
- Model selection (-m, --model)
- System prompts (-s, --system)
- Temperature control (-t, --temp)
- Conversation save/load
- Streaming responses
- Command interface
- Colored output

## Usage Commands
- `/exit`, `/quit` - End session
- `/clear` - Clear conversation
- `/save` - Save conversation to ~/.ollama_chat_history
- `/load` - Load previous conversation
- `/model MODEL` - Switch model (e.g., /model gemma3:4b)
- `/temp TEMP` - Change temperature (0.0-1.0)
- `/help` - Show available commands

## Requirements
- Ollama running: `ollama serve`
- jq installed: `brew install jq`
- Model downloaded: `ollama pull gemma3:12b`

## Location
Scripts are in workspace root:
- `/Users/tinyclaw/.openclaw/workspace/ollama-chat.sh`
- `/Users/tinyclaw/.openclaw/workspace/ollama-chat-advanced.sh`

## Quick Start
```bash
# Start Ollama server
ollama serve

# Run basic chat
./ollama-chat.sh

# Run advanced chat with custom settings
./ollama-chat-advanced.sh -m gemma3:12b -t 0.7
```

Both scripts use the Ollama API endpoint and work around the terminal control issues in the native CLI.