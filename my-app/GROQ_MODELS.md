# Available Groq Models

## Production Models (Recommended for Production)

### Text Generation Models

1. **llama-3.1-8b-instant** (Currently Used)
   - Speed: ~560 tokens/sec
   - Price: $0.05/1M input, $0.08/1M output
   - Context: 131,072 tokens
   - Max Completion: 131,072 tokens
   - Best for: Fast, cost-effective text generation

2. **llama-3.3-70b-versatile**
   - Speed: ~280 tokens/sec
   - Price: $0.59/1M input, $0.79/1M output
   - Context: 131,072 tokens
   - Max Completion: 32,768 tokens
   - Best for: Higher quality, more complex tasks

3. **openai/gpt-oss-120b**
   - Speed: ~500 tokens/sec
   - Price: $0.15/1M input, $0.60/1M output
   - Context: 131,072 tokens
   - Max Completion: 65,536 tokens
   - Best for: High-quality responses with built-in tools

4. **openai/gpt-oss-20b**
   - Speed: ~1000 tokens/sec
   - Price: $0.075/1M input, $0.30/1M output
   - Context: 131,072 tokens
   - Max Completion: 65,536 tokens
   - Best for: Fast, efficient text generation

### Specialized Models

5. **whisper-large-v3** (Speech to Text)
   - Price: $0.111 per hour
   - Max File Size: 100 MB
   - Best for: Audio transcription

6. **whisper-large-v3-turbo** (Speech to Text)
   - Price: $0.04 per hour
   - Best for: Fast audio transcription

7. **meta-llama/llama-guard-4-12b** (Content Moderation)
   - Speed: ~1200 tokens/sec
   - Price: $0.20/1M input, $0.20/1M output
   - Context: 131,072 tokens
   - Best for: Content safety and moderation

## Preview Models (For Evaluation)

- **meta-llama/llama-4-maverick-17b-128e-instruct** - 600 tps, $0.20/$0.60
- **meta-llama/llama-4-scout-17b-16e-instruct** - 750 tps, $0.11/$0.34
- **moonshotai/kimi-k2-instruct-0905** - 200 tps, $1.00/$3.00 (262K context!)
- **qwen/qwen3-32b** - 400 tps, $0.29/$0.59

## Systems (Agentic AI)

- **groq/compound** - AI system with built-in tools (web search, code execution)
- **groq/compound-mini** - Lighter version of compound

## Current Usage

Your app currently uses: **llama-3.1-8b-instant**

This is a good choice for:
- ✅ Fast response times
- ✅ Cost-effective
- ✅ Medical report analysis
- ✅ Text extraction from PDFs

## Recommendations

For medical report analysis, consider:
1. **llama-3.1-8b-instant** (current) - Best balance of speed and quality
2. **llama-3.3-70b-versatile** - If you need higher accuracy for complex medical terms
3. **openai/gpt-oss-120b** - If you need built-in reasoning capabilities

## API Endpoint

To get all available models:
```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY"
```
