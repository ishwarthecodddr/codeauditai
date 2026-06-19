from pydantic import BaseModel, Field
from typing import List, Literal

class ReviewIssueModel(BaseModel):
    issue: str = Field(description="Clear description of the issue or vulnerability.")
    severity: Literal["low", "medium", "high", "critical"] = Field(description="Severity of the issue.")
    suggested_fix: str = Field(description="A brief suggestion or code snippet showing how to resolve the issue.")

class AuditIssuesList(BaseModel):
    issues: List[ReviewIssueModel] = Field(description="List of issues identified during the audit.")

class ArchitectFix(BaseModel):
    updated_code: str = Field(description="The complete, updated, optimized and secured source code.")
    explanation: str = Field(description="A summary explanation of the changes made and why.")
