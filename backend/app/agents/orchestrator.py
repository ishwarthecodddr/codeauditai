import json
from google import genai
from google.genai import types
from app.core.config import settings
from app.core.state import AgentState
from app.models.schemas import ArchitectFix

# Initialize Gemini Client
client = genai.Client(api_key=settings.gemini_api_key or None)

async def orchestrator_node(state: AgentState) -> dict:
    """
    Lead Architect fixer node. Compiles performance and security audit reports.
    If issues are found, calls Gemini to generate corrected code.
    If no issues are found, sets review_complete = True.
    """
    code = state.get("current_code", "")
    language = state.get("language", "python")
    performance_issues = state.get("performance_issues", [])
    security_vulnerabilities = state.get("security_vulnerabilities", [])
    iteration_count = state.get("iteration_count", 0)
    
    total_issues = len(performance_issues) + len(security_vulnerabilities)
    
    # If no issues found, we are done
    if total_issues == 0:
        return {
            "review_complete": True,
            "iteration_count": iteration_count
        }
        
    # Compile issues into text lists
    perf_desc = "\n".join([f"- [Performance: {i.get('severity')}] {i.get('issue')}. Suggested fix: {i.get('suggested_fix')}" for i in performance_issues])
    sec_desc = "\n".join([f"- [Security: {i.get('severity')}] {i.get('issue')}. Suggested fix: {i.get('suggested_fix')}" for i in security_vulnerabilities])
    
    prompt = f"""You are the Lead Architect. You are responsible for refactoring and securing code.
Please modify the following {language} code to resolve the performance bottlenecks and security vulnerabilities identified.

Current Code:
```
{code}
```

Performance Issues Found:
{perf_desc if perf_desc else "None"}

Security Vulnerabilities Found:
{sec_desc if sec_desc else "None"}

Instructions:
1. Address all performance and security issues.
2. Maintain functional parity (the logic must do the same thing, return same outputs for same inputs).
3. Do not introduce new bugs, lint issues, or syntax errors.
4. Return the entire corrected code. Do not truncate the code.
5. Provide a summary of the fixes.
"""

    try:
        response = client.models.generate_content(
            model=settings.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ArchitectFix,
                temperature=0.2,
            )
        )
        
        data = json.loads(response.text)
        updated_code = data.get("updated_code", code)
        
        # If code didn't change, stop iterating
        review_complete = False
        if updated_code.strip() == code.strip():
            review_complete = True
            
    except Exception as e:
        print(f"Error in Lead Architect node: {e}")
        updated_code = code
        review_complete = True
        
    return {
        "current_code": updated_code,
        "iteration_count": iteration_count + 1,
        "review_complete": review_complete
    }
