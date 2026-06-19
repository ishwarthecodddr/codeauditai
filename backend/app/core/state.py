from typing import TypedDict, List, Dict, Any

class ReviewIssue(TypedDict):
    issue: str
    severity: str  # "low", "medium", "high", "critical"
    suggested_fix: str

class AgentState(TypedDict):
    original_code: str
    language: str
    current_code: str
    performance_issues: List[ReviewIssue]
    security_vulnerabilities: List[ReviewIssue]
    iteration_count: int
    review_complete: bool
