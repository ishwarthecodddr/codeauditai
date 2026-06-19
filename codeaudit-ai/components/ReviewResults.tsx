import { ReviewIssue } from "@/types";
import { AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

interface ReviewResultsProps {
  performance: ReviewIssue[];
  security: ReviewIssue[];
  iterationCount: number;
}

export default function ReviewResults({ performance, security, iterationCount }: ReviewResultsProps) {
  
  // Helper to determine category severity
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
        label: "Critical", 
        classes: "bg-[var(--severity-critical-bg)] border-[var(--severity-critical-border)] text-[var(--severity-critical-text)]" 
      };
    }
    return { 
      label: "Warning", 
      classes: "bg-[var(--severity-warning-bg)] border-[var(--severity-warning-border)] text-[var(--severity-warning-text)]" 
    };
  };

  const perfStatus = getCategoryStatus(performance);
  const secStatus = getCategoryStatus(security);

  const renderCategoryCard = (
    title: string,
    issues: ReviewIssue[],
    icon: React.ReactNode,
    status: { label: string; classes: string }
  ) => {
    return (
      <div className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-lg overflow-hidden transition-all duration-150 ease-in-out flex flex-col min-h-[220px]">
        {/* Card Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="text-[var(--muted-text)] shrink-0">{icon}</div>
            <span className="text-xs font-semibold tracking-tight text-[var(--text-color)]">{title}</span>
          </div>
          <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${status.classes}`}>
            {status.label}
          </span>
        </div>

        {/* Card Content */}
        <div className="p-3 flex-grow overflow-y-auto">
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-[var(--severity-clean-bg)] rounded-md border border-[var(--severity-clean-border)] transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs text-[var(--muted-text)] font-sans">
                No vulnerabilities or issues identified.
              </span>
            </div>
          ) : (
            <div className="space-y-0">
              {issues.map((iss, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-2.5 border-b border-[var(--border-color)] last:border-b-0">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs text-[var(--text-color)] leading-relaxed font-sans">
                      {iss.issue}
                    </span>
                    <span className={`text-[8px] font-mono font-bold uppercase shrink-0 px-1 py-0.5 rounded ${
                      iss.severity === 'critical' || iss.severity === 'high' 
                        ? 'bg-[var(--severity-critical-bg)] text-[var(--severity-critical-text)]'
                        : 'bg-[var(--severity-warning-bg)] text-[var(--severity-warning-text)]'
                    }`}>
                      {iss.severity}
                    </span>
                  </div>
                  {iss.suggested_fix && (
                    <code className="font-mono text-[10px] bg-[var(--inset-bg)] border border-[var(--border-color)] px-2 py-1.5 rounded-md text-[var(--muted-text)] block overflow-x-auto whitespace-pre leading-normal">
                      {iss.suggested_fix}
                    </code>
                  )}
                </div>
              ))}
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
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">
          Audit Reports
        </span>
        
        {/* Iterations Small Pill */}
        <span className="text-[10px] font-mono font-bold bg-[var(--inset-bg)] border border-[var(--border-color)] text-[var(--muted-text)] px-2.5 py-0.5 rounded-full">
          Iterations: {iterationCount}
        </span>
      </div>

      {/* Categories Cards Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-grow overflow-y-auto">
        {renderCategoryCard(
          "Performance Auditor", 
          performance, 
          <AlertTriangle className="w-4 h-4 text-amber-500" />, 
          perfStatus
        )}
        {renderCategoryCard(
          "Security Auditor", 
          security, 
          <ShieldAlert className="w-4 h-4 text-red-500" />, 
          secStatus
        )}
      </div>

    </div>
  );
}
