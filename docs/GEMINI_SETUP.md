# Google Gemini API Setup

## Step 1: Get API Key

1. **Go to Google AI Studio**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Select project or create new one
   - Copy the API key

3. **Save to Environment**
   ```bash
   # Add to .env
   GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXX"
   ```

## Step 2: Model Selection

### Free Tier (Recommended for MVP)

- **Gemini 1.5 Flash**: Free tier available
  - 15 requests/minute
  - 1 million requests/day
  - Best for: Quick resume improvements, content generation

### Paid Tier (For Production)

- **Gemini 1.5 Pro**: Better quality, higher limits
  - 2 requests/minute (free)
  - $0.00025/1K characters input
  - $0.0005/1K characters output
  - Best for: Resume analysis, cover letters

## API Endpoints

### 1. Generate Resume Content

**POST** `/api/ai/generate`

Generate new resume sections or full content.

**Request:**

```json
{
  "prompt": "Create a work experience entry for a software engineer at Google",
  "context": "5 years experience, led team of engineers",
  "resumeId": "optional-existing-resume-id"
}
```

**Response:**

```json
{
  "content": "Generated resume JSON content",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 300,
    "totalTokens": 450
  }
}
```

### 2. Improve Section

**POST** `/api/ai/improve`

Improve existing resume sections.

**Request:**

```json
{
  "section": "work",
  "content": {
    "name": "Tech Corp",
    "position": "Software Engineer",
    "highlights": ["Built features"]
  },
  "instructions": "Make more impactful with metrics"
}
```

**Response:**

```json
{
  "improved": "Improved section in JSON format",
  "usage": { ... }
}
```

### 3. Analyze Resume

**POST** `/api/ai/analyze`

Get AI-powered resume analysis and suggestions.

**Request:**

```json
{
  "resumeId": "uuid-of-resume",
  "targetRole": "Senior Software Engineer"
}
```

**Response:**

```json
{
  "analysis": {
    "strengths": [...],
    "improvements": [...],
    "atsScore": 85,
    "recommendations": [...]
  },
  "usage": { ... }
}
```

## Cost Optimization

### Free Tier Usage

```javascript
// Gemini 1.5 Flash - Free tier
const result = await generateText({
  model: google("gemini-1.5-flash"),
  messages: [...],
  maxTokens: 1000, // Limit output
});
```

### Paid Tier Usage

```javascript
// Gemini 1.5 Pro - Better quality
const result = await generateText({
  model: google("gemini-1.5-pro"),
  messages: [...],
  maxTokens: 1500,
});
```

### Best Practices

1. **Cache System Prompts**: Reuse prompts when possible
2. **Set Token Limits**: Use `maxTokens` to control costs
3. **Use Flash for Simple Tasks**: Reserve Pro for complex analysis
4. **Rate Limiting**: Implement request throttling

## Testing Locally

```bash
# Set API key
echo 'GEMINI_API_KEY="your-key-here"' >> .env

# Start API server
cd apps/api
bun dev

# Test generate endpoint
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a professional summary for a software engineer"
  }'
```

## Error Handling

### Common Errors

**1. API Key Missing**

```
Error: GEMINI_API_KEY not configured
```

Solution: Add key to `.env` file

**2. Rate Limit Exceeded**

```
Error: 429 Too Many Requests
```

Solution: Implement request queuing or upgrade to paid tier

**3. Invalid Model**

```
Error: Model not found
```

Solution: Use `gemini-1.5-flash` or `gemini-1.5-pro`

## Production Deployment

### Environment Variables (Lambda)

```bash
# AWS Lambda environment
aws lambda update-function-configuration \
  --function-name yukti-ai-function \
  --environment Variables="{GEMINI_API_KEY=AIzaSy...}"
```

### Monitoring Usage

- Track token usage in database
- Set up CloudWatch alarms for costs
- Monitor rate limits

## Prompt Engineering Tips

### Good Prompts

✅ "Improve this work experience entry by adding quantifiable metrics and action verbs"
✅ "Generate 3 bullet points for a senior developer role highlighting leadership"

### Bad Prompts

❌ "Make it better"
❌ "Write my resume"

### Context Matters

Include:

- Current content (for improvements)
- Target role/industry
- Experience level
- Specific requirements

## Security Notes

⚠️ **Never expose API key in frontend**
⚠️ **Always validate user input before passing to AI**
⚠️ **Sanitize AI output before saving to database**
⚠️ **Implement rate limiting per user**

## Next Steps

1. ✅ Get Gemini API key
2. ✅ Add to environment variables
3. ⏭️ Test AI endpoints in Postman
4. ⏭️ Integrate with frontend editor
5. ⏭️ Add usage tracking and limits
