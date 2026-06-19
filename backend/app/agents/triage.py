from app.core.state import AgentState

async def triage_node(state: AgentState) -> dict:
    """
    Triages the input code, identifies the programming language if unknown,
    and initializes the audit state.
    """
    code = state.get("original_code", "")
    language = state.get("language", "unknown")
    
    # Simple fallback language detection
    if language == "unknown" or not language:
        code_stripped = code.strip()
        if code_stripped.startswith("def ") or "import " in code_stripped and ":" in code_stripped:
            language = "python"
        elif "function " in code_stripped or "const " in code_stripped or "let " in code_stripped or "import " in code_stripped:
            language = "javascript"
        else:
            language = "python" # Default fallback
            
    return {
        "language": language,
        "current_code": code,
        "performance_issues": [],
        "security_vulnerabilities": [],
        "iteration_count": 0,
        "review_complete": False
    }
