import { useState } from "react";
import { ReviewIssue } from "@/types";
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  ShieldCheck 
} from "lucide-react";

interface ReviewResultsProps {
  performance: ReviewIssue[];
  security: ReviewIssue[];
  iterationCount: number;
}

export default function ReviewResults({ performance, security, iterationCount }: ReviewResultsProps) {
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<string | null>(null);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const handleCopySnippet = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSnippetIdx(id);
      setTimeout(() => setCopiedSnippetIdx(null), 2000);
    } catch (err) {
      console.error("Failed to copy snippet: ", err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIssue(expandedIssue === id ? null : id);
  };

  const getCategoryStatus = (issues: ReviewIssue[]) => {
    if (issues.length === 0) {
      return { 
        label: "Clean", 
        classes: "bg-[var(--severity-clean-bg)] border-[var(--severity-clean-border)] text-[var(--severity-clean-text)]" 
      };
    }
    const hasCriticalOrHigh = issues.some(
      (i) => i.severity.toLowerCase() === "critical" || i.severity.toLowerCase() === "high"
    );
    if (hasCriticalOrHigh) {
      return { 
        label: `${issues.length} Issue${issues.length > 1 ? 's' : ''} (Critical)`, 
        classes: "bg-[var(--severity-critical-bg)] border-[var(--severity-critical-border)] text-[var(--severity-critical-text)]" 
      };
    }
    return { 
      label: `${issues.length} Warning${issues.length > 1 ? 's' : ''}`, 
      classes: "bg-[var(--severity-warning-bg)] border-[var(--severity-warning-border)] text-[var(--severity-warning-text)]" 
    };
  };

  const perfStatus = getCategoryStatus(performance);
  const secStatus = getCategoryStatus(security);

  const renderCategoryCard = (
    title: string,
    categoryKey: string,
    issues: ReviewIssue[],
    icon: React.ReactNode,
    status: { label: string; classes: string }
  ) => {
    return (
      <div className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm transition-all duration-200 ease-in-out flex flex-col min-h-[220px]">
        
        {/* Card Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] shrink-0 bg-[var(--panel-bg)]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-[var(--inset-bg)] border border-[var(--border-color)] shrink-0">
              {icon}
            </div>
            <span className="text-xs font-bold tracking-tight text-[var(--text-color)]">{title}</span>
          </div>
          <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${status.classes}`}>
            {status.label}
          </span>
        </div>

        {/* Card Content */}
        <div className="p-3 flex-grow overflow-y-auto max-h-[320px]">
          {issues.length === 0 ? (
            <div className="flex items-center gap-2.5 p-3.5 bg-[var(--severity-clean-bg)] rounded-lg border border-[var(--severity-clean-border)] transition-colors">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs text-[var(--text-color)] font-medium">
                No vulnerabilities or issues identified in this scan.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {issues.map((iss, idx) => {
                const issueId = `${categoryKey}-${idx}`;
                const isExpanded = expandedIssue === issueId;

                return (
                  <div 
                    key={idx} 
                    className="flex flex-col gap-2 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--inset-bg)] transition-all duration-150"
                  >
                    <div 
                      onClick={() => toggleExpand(issueId)}
                      className="flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-[var(--text-color)] font-medium leading-relaxed font-sans">
                          {iss.issue}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                          iss.severity.toLowerCase() === 'critical' || iss.severity.toLowerCase() === 'high' 
                            ? 'bg-[var(--severity-critical-bg)] border-[var(--severity-critical-border)] text-[var(--severity-critical-text)]'
                            : 'bg-[var(--severity-warning-bg)] border-[var(--severity-warning-border)] text-[var(--severity-warning-text)]'
                        }`}>
                          {iss.severity}
                        </span>
                        {iss.suggested_fix && (
                          <div className="text-[var(--muted-text)]">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </div>
                        )}
                      </div>
                    </div>

                    {iss.suggested_fix && isExpanded && (
                      <div className="mt-2 pt-2 border-t border-[var(--border-color)] flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-[var(--muted-text)] uppercase">
                            Suggested Fix
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopySnippet(iss.suggested_fix!, issueId);
                            }}
                            className="p-1 rounded hover:bg-[var(--panel-bg)] border border-[var(--border-color)] text-[var(--muted-text)] hover:text-[var(--text-color)] transition-all cursor-pointer flex items-center gap-1 text-[10px]"
                            title="Copy Fix Snippet"
                          >
                            {copiedSnippetIdx === issueId ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <code className="font-mono text-[11px] bg-[var(--panel-bg)] border border-[var(--border-color)] p-2.5 rounded-md text-[var(--text-color)] block overflow-x-auto whitespace-pre leading-relaxed">
                          {iss.suggested_fix}
                        </code>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between shrink-0 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-color)]" />
          Audit Analysis & Reports
        </span>
        
        {/* Iterations Badge */}
        <span className="text-[10px] font-mono font-bold bg-[var(--panel-bg)] border border-[var(--border-color)] text-[var(--muted-text)] px-2.5 py-0.5 rounded-full shadow-2xs">
          Iterations: {iterationCount}
        </span>
      </div>

      {/* Categories Cards Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-grow overflow-y-auto">
        {renderCategoryCard(
          "Performance Auditor", 
          "perf",
          performance, 
          <Zap className="w-4 h-4 text-amber-500" />, 
          perfStatus
        )}
        {renderCategoryCard(
          "Security Auditor", 
          "sec",
          security, 
          <ShieldAlert className="w-4 h-4 text-red-500" />, 
          secStatus
        )}
      </div>

    </div>
  );
}
