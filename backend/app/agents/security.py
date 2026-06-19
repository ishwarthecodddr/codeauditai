import json
from google import genai
from google.genai import types
from app.core.config import settings
from app.core.state import AgentState
from app.models.schemas import AuditIssuesList

# Initialize Gemini Client
client = genai.Client(api_key=settings.gemini_api_key or None)

async def security_node(state: AgentState) -> dict:
    """
    Security Auditor node. Scans code for security vulnerabilities,
    insecure functions (like eval), injection risks, and sensitive leaks.
    """
    code = state.get("current_code", "")
    language = state.get("language", "python")
    
    prompt = f"""You are an expert Security Auditor. Scan the following {language} code for security vulnerabilities, injection risks (SQL, OS Command, HTML/XSS), unsafe use of functions (e.g., eval, exec, pickle.loads in Python, innerHTML in JS), hardcoded secrets (API keys, passwords), weak cryptography, path traversal, or privilege escalation.

Code to audit:
```
{code}
```

Return a list of security vulnerabilities. For each vulnerability, specify:
- description of the issue
- severity (low, medium, high, critical)
- suggested fix

If there are no security vulnerabilities, return an empty list of issues.
"""

    try:
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
        
        formatted_issues = []
        for iss in issues:
            formatted_issues.append({
                "issue": iss.get("issue", ""),
                "severity": iss.get("severity", "low"),
                "suggested_fix": iss.get("suggested_fix", "")
            })
            
    except Exception as e:
        print(f"Error in Security node: {e}")
        formatted_issues = [{
            "issue": f"Security audit failed: {str(e)}",
            "severity": "medium",
            "suggested_fix": "Ensure GEMINI_API_KEY is configured."
        }]
        
    return {"security_vulnerabilities": formatted_issues}
