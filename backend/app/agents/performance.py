import json
from google import genai
from google.genai import types
from app.core.config import settings
from app.core.state import AgentState
from app.models.schemas import AuditIssuesList

# Initialize Gemini Client
# If api_key is empty/None, Client() will fallback to GEMINI_API_KEY env variable automatically
client = genai.Client(api_key=settings.gemini_api_key or None)

async def performance_node(state: AgentState) -> dict:
    """
    Performance Auditor node. Analyzes code for execution bottlenecks,
    high complexity, memory bloat, and resource leaks.
    """
    code = state.get("current_code", "")
    language = state.get("language", "python")
    
    prompt = f"""You are an expert Performance Auditor. Analyze the following {language} code for execution bottlenecks, high time complexity (e.g. O(N^2) loops where O(N) or O(N log N) is possible), high space complexity, excessive memory allocations, unclosed files/database connections, or redundant iterations.

Code to audit:
```
{code}
```

Return a list of performance issues. For each issue, specify:
- description of the issue
- severity (low, medium, high, critical)
- suggested fix

If there are no performance issues, return an empty list of issues.
"""

    try:
        # Generate content with structured JSON output
        response = client.models.generate_content(
            model=settings.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AuditIssuesList,
                temperature=0.1,
            ),
        )
        
        data = json.loads(response.text)
        issues = data.get("issues", [])
        
        # Map output to list of dicts matching ReviewIssue format
        formatted_issues = []
        for iss in issues:
            formatted_issues.append({
                "issue": iss.get("issue", ""),
                "severity": iss.get("severity", "low"),
                "suggested_fix": iss.get("suggested_fix", "")
            })
            
    except Exception as e:
        print(f"Error in Performance node: {e}")
        # Return fallback error if model fails or key is missing
        formatted_issues = [{
            "issue": f"Performance audit failed: {str(e)}",
            "severity": "medium",
            "suggested_fix": "Ensure GEMINI_API_KEY is configured."
        }]
        
    return {"performance_issues": formatted_issues}
