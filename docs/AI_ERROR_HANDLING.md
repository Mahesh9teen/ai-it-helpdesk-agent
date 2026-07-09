# AI-Powered Error Handling & Automatic Recovery System

## Overview

The application now includes an **intelligent error handling system** that uses Ollama + LLaMA to automatically diagnose application errors and attempt automatic recovery. When an error occurs, the system:

1. **Analyzes** the error using AI to understand root causes
2. **Diagnoses** the problem with context and severity assessment
3. **Recommends** fixes based on the error type and context
4. **Automatically recovers** from common error patterns when safe to do so
5. **Reports** findings to the user with suggested manual fixes if needed

## Architecture

### Backend Components

#### 1. **ErrorAIAnalyzer Service** (`app/services/error_ai_service.py`)
- Analyzes errors using Ollama + LLaMA3.2
- Extracts AI recommendations for fixes
- Executes auto-fix actions when confidence is high
- Provides fallback responses when AI is unavailable

**Key Methods:**
- `analyze_error()` - Sends error to AI for analysis
- `execute_auto_fix()` - Attempts automatic error recovery
- `_determine_auto_fix()` - Selects appropriate fix based on error type

#### 2. **Error Handling Middleware** (`app/core/error_middleware.py`)
- Intercepts all exceptions automatically
- Extracts error context (path, method, body, client info)
- Calls ErrorAIAnalyzer for diagnosis
- Attempts auto-recovery if AI recommends it
- Returns detailed error response with AI diagnosis

**Processing Flow:**
```
Request → Middleware → Exception → AI Analysis → Auto-Fix Attempt → Response
```

#### 3. **Error Analysis API** (`app/api/v1/errors.py`)
- `/api/v1/errors/analyze` - POST endpoint for error analysis
- `/api/v1/errors/auto-fix` - POST endpoint for executing auto-fixes

#### 4. **Test Error Endpoints** (`app/api/v1/test_errors.py`)
- `/api/v1/test/error/database` - Simulate DB connection error
- `/api/v1/test/error/validation` - Simulate validation error
- `/api/v1/test/error/timeout` - Simulate timeout error
- `/api/v1/test/error/rag` - Simulate RAG error
- `/api/v1/test/error/ollama` - Simulate Ollama connection error
- `/api/v1/test/ai-recovery/status` - Get AI recovery status

### Frontend Components

#### 1. **AI Error Boundary** (`frontend/src/components/AIErrorBoundary.jsx`)
- React Error Boundary component that catches component errors
- Sends errors to backend for AI analysis
- Displays AI diagnosis and suggested fixes to users
- Attempts automatic recovery with visual feedback
- Provides manual recovery options (Reload, Send Report)

**Features:**
- Real-time error analysis with AI diagnosis
- Shows severity level (critical, high, medium, low)
- Displays root cause analysis
- Lists suggested fixes
- Visual recovery progress indicator
- Error email report generation
- Dark mode support

## Supported Auto-Fix Actions

The system can automatically recover from these error patterns:

| Error Type | Auto-Fix Action | Recovery Method |
|-----------|-----------------|-----------------|
| `DatabaseConnectionError` | `reconnect` | Creates new DB connection |
| `TimeoutError` | `retry` | Retries with exponential backoff (max 3 attempts) |
| `ValidationError` | `sanitize` | Cleans and validates input data |
| `ServiceUnavailableError` | `fallback` | Switches to fallback service/cached data |
| `OllamaConnectionError` | `reconnect` | Reconnects to Ollama service |
| `RAGError` | `reinit` | Reinitializes RAG system and FAISS index |

## AI Error Analysis Prompt

The system sends errors to LLaMA with this analysis prompt:

```
ERROR TYPE: [type]
ERROR MESSAGE: [message]
CONTEXT: [request info, user data, etc.]
TRACEBACK: [full stack trace]
```

**AI Response Format (JSON):**
```json
{
  "diagnosis": "Brief explanation of what went wrong",
  "severity": "critical|high|medium|low",
  "root_cause": "Root cause analysis",
  "suggested_fixes": ["Fix 1", "Fix 2", "Fix 3"],
  "auto_fix_recommendation": "reconnect|retry|sanitize|fallback|reinit|none",
  "confidence": 0.0-1.0,
  "notes": "Additional notes"
}
```

Auto-fixes only execute if AI confidence ≥ 70%.

## Usage

### Testing AI Error Handling

1. **Start the application:**
   ```bash
   docker-compose up
   ```

2. **Trigger a test error:**
   ```bash
   # Database connection error
   curl http://localhost:8000/api/v1/test/error/database
   
   # Timeout error
   curl http://localhost:8000/api/v1/test/error/timeout
   
   # RAG error
   curl http://localhost:8000/api/v1/test/error/rag
   
   # Validation error
   curl http://localhost:8000/api/v1/test/error/validation
   
   # Ollama connection error
   curl http://localhost:8000/api/v1/test/error/ollama
   ```

3. **Check AI recovery status:**
   ```bash
   curl http://localhost:8000/api/v1/test/ai-recovery/status
   ```

4. **View AI Analysis in Response:**
   The error response includes:
   - AI diagnosis and root cause
   - Severity level
   - Suggested fixes (up to 3)
   - Auto-fix attempt details
   - Recovery status

### Frontend Error Testing

The frontend Error Boundary will automatically:
1. Catch component rendering errors
2. Send to backend for AI analysis
3. Display diagnosis UI
4. Attempt auto-recovery
5. Provide manual recovery options

## Configuration

### Environment Variables

- `OLLAMA_HOST` - Ollama API endpoint (default: `http://ollama:11434`)
- `OLLAMA_MODEL_NAME` - LLM model to use (default: `llama3.2`)
- `OLLAMA_EMBEDDING_MODEL` - Embedding model for RAG (default: `nomic-embed-text`)

### Error Analysis Parameters

Adjust in `ErrorAIAnalyzer`:
- `temperature` - Set to 0.3 for consistent analysis
- `timeout` - Request timeout to Ollama (default: 30s)
- Confidence threshold - Min 0.7 for auto-fix (adjustable in `_determine_auto_fix()`)

## Logging

All error analyses are logged with:
- Error type and message
- AI diagnosis
- Severity level
- Auto-fix action and result
- Recovery status

**Log Levels:**
- `ERROR` - Error analysis and failures
- `INFO` - Successful auto-fixes
- `DEBUG` - Detailed analysis steps

## Response Examples

### Successful Error Analysis with Auto-Fix

```json
{
  "error": "Failed to connect to PostgreSQL at localhost:5432",
  "error_type": "DatabaseConnectionError",
  "ai_diagnosis": {
    "diagnosis": "Database connection failed - possible connection pool exhaustion or service unavailability",
    "severity": "critical",
    "root_cause": "PostgreSQL service not responding on configured port",
    "suggested_fixes": [
      "Verify PostgreSQL is running and accessible",
      "Check database connection pool settings",
      "Review firewall rules for database port access"
    ]
  },
  "auto_fix": {
    "attempted": true,
    "action": "reconnect",
    "result": {
      "success": true,
      "message": "Database connection restored"
    }
  },
  "recovery_status": "success"
}
```

### Error with Manual Recovery Required

```json
{
  "error": "Input validation failed",
  "error_type": "ValidationError",
  "ai_diagnosis": {
    "diagnosis": "Invalid data format in request body",
    "severity": "low",
    "root_cause": "Email field does not match RFC 5322 format",
    "suggested_fixes": [
      "Verify email address format",
      "Use standard email validation",
      "Check for special characters in email"
    ]
  },
  "auto_fix": {
    "attempted": true,
    "action": "sanitize",
    "result": {
      "success": true,
      "message": "Input data sanitized successfully"
    }
  },
  "recovery_status": "success"
}
```

## Performance

- **Analysis Time**: ~1-3 seconds (depends on Ollama model speed)
- **Auto-Fix Execution**: <100ms for most operations
- **Memory Overhead**: Minimal (AI calls are async, non-blocking)
- **Timeout Protection**: 30-second timeout on all AI requests

## Limitations

1. **AI Availability**: System falls back to basic error info if Ollama is unavailable
2. **Network Errors**: Cannot auto-recover all network-related issues
3. **Hardware Failures**: Cannot fix underlying infrastructure problems
4. **Security Errors**: Will not auto-execute fixes for security-related errors
5. **Cost**: Each error analysis costs one LLM API call

## Best Practices

1. **Log Context**: Always include relevant context in error data for better diagnosis
2. **Test Error Scenarios**: Use test endpoints to validate error handling
3. **Monitor AI Success Rate**: Track which auto-fixes succeed vs. fail
4. **User Communication**: Always inform users of what auto-recovery action was attempted
5. **Fallback Handling**: Implement fallback mechanisms for critical services

## Future Enhancements

- [ ] Machine learning model to predict which auto-fixes will succeed
- [ ] Automatic error pattern learning from recurring issues
- [ ] Multi-language error messages based on user locale
- [ ] Error analytics dashboard
- [ ] Integration with incident management systems
- [ ] Automated remediation for common infrastructure issues
- [ ] Historical error trend analysis
- [ ] Proactive error prevention based on patterns

## Integration Points

### With Existing Services

1. **Chat Service** - Errors logged to conversation history
2. **Ticket System** - Critical errors auto-create support tickets
3. **Monitoring Service** - Tracks error frequency and recovery rates
4. **Analytics** - Reports AI diagnosis effectiveness
5. **Logging** - All errors sent to centralized logging

### Third-party Systems

- Slack notifications for critical errors
- PagerDuty alerts for unrecoverable errors
- Sentry/Rollbar integration for error tracking
- CloudWatch/DataDog metrics

## Support & Troubleshooting

### Ollama Not Responding

If `OllamaConnectionError` occurs frequently:
1. Verify Ollama service is running: `docker logs helpdesk-ollama-1`
2. Check network connectivity: `ping ollama`
3. Verify port 11434 is open
4. Restart Ollama: `docker-compose restart ollama`

### AI Analysis Timeout

If analysis takes too long:
1. Check Ollama system load: `docker stats`
2. Reduce model complexity or use smaller model
3. Increase timeout in `ErrorAIAnalyzer` constructor
4. Clear Ollama cache: `ollama serve --rm-cache`

### Auto-Fix Not Executing

Check these factors:
1. AI confidence score < 70%
2. Error type not in supported list
3. Context data incomplete
4. Backend service unavailable
5. Check logs for detailed failure reason

## Testing Checklist

- [ ] Test database connection error and auto-recovery
- [ ] Test timeout error with exponential backoff
- [ ] Test validation error sanitization
- [ ] Test Ollama reconnection
- [ ] Test frontend error boundary UI
- [ ] Test error email report generation
- [ ] Test manual recovery options
- [ ] Test error response format
- [ ] Verify AI diagnosis accuracy
- [ ] Monitor error logging
