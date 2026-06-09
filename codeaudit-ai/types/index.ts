export interface ReviewIssue {
  issue: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface ReviewResult {
  original_code: string;
  updated_code: string;
  performance_issues: ReviewIssue[];
  security_vulnerabilities: ReviewIssue[];
  iteration_count: number;
  review_complete: boolean;
}

export interface StatusMessage {
  type: "status";
  node: string;
  message: string;
}

export interface ResultMessage extends ReviewResult {
  type: "result";
}

export type WebSocketMessage = StatusMessage | ResultMessage | { type: "error", message: string };
