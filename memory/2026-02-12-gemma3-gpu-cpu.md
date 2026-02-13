# Ollama Gemma3 12B GPU vs CPU Notes

## Problem
- gemma3:12b crashes on GPU with "llama runner terminated (exit status 2)" - native Metal/MLX segfault
- gemma3:4b works fine on GPU
- Issue: MLX library mismatch + memory pressure on 16GB Mac

## Solution
- Force CPU with `PARAMETER num_gpu 0` in Modelfile
- Created `gemma3:12b-cpu` variant that works reliably

## Performance Comparison
- GPU (4b): ~1s total, 3.9s load (cold), 0.95s (warm)
- CPU (12b): ~77-82s total, 150ms load (warm), 99 tok/s prompt eval, 1 tok/s generation

## Key Insight
Metal backend unstable for large models on this setup; CPU path stable but slow.