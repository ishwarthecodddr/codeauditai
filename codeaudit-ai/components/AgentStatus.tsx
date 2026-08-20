import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, Loader2, Terminal, Activity } from "lucide-react";

interface AgentStatusProps {
  currentNode: string;
  message: string;
  isComplete: boolean;
}

export default function AgentStatus({ currentNode, message, isComplete }: AgentStatusProps) {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    { name: "Triage", label: "Triage & Parse Code" },
    { name: "Performance", label: "Performance Audit" },
    { name: "Security", label: "Security & Vulnerability Scan" },
    { name: "Lead Architect", label: "Lead Architect Refactor" },
  ];

  const stepNames = steps.map((s) => s.name);
  const activeIdx = stepNames.indexOf(currentNode);

  return (
    <div className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-xl p-4 sm:p-5 shadow-sm transition-all duration-200 ease-in-out">
      
      {/* Mobile Accordion Toggle Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex lg:hidden items-center justify-between w-full min-h-8 focus:outline-none cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--accent-color)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)]">
            Live Orchestrator
          </span>
        </div>
        <div className="text-[var(--muted-text)]">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Desktop static header */}
      <div className="hidden lg:flex items-center justify-between pb-3.5 border-b border-[var(--border-color)] mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)] flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {!isComplete && activeIdx >= 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-color)] opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isComplete ? 'bg-emerald-500' : activeIdx >= 0 ? 'bg-[var(--accent-color)]' : 'bg-slate-400'}`}></span>
          </span>
          Live Orchestrator Pipeline
        </span>

        {isComplete ? (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Complete
          </span>
        ) : activeIdx >= 0 ? (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--active-bg)] border border-[var(--accent-border)] text-[var(--accent-color)] flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Auditing
          </span>
        ) : (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--inset-bg)] border border-[var(--border-color)] text-[var(--muted-text)]">
            Standby
          </span>
        )}
      </div>

      {/* Accordion content */}
      <div className={`mt-3 lg:mt-0 space-y-4 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        
        {/* Stepper Grid */}
        <div className="orchestrator-stepper">
          {steps.map((step, idx) => {
            const isActive = currentNode === step.name && !isComplete;
            const isDone = isComplete || (activeIdx > idx) || (step.name === "Lead Architect" && isComplete);
            
            return (
              <div 
                key={step.name} 
                className={`orchestrator-step relative flex items-center justify-between min-h-10 px-3 py-2 rounded-lg transition-all duration-150 ease-in-out ${
                  isActive 
                    ? 'bg-[var(--active-bg)] border border-[var(--accent-border)]' 
                    : isDone
                      ? 'bg-[var(--panel-bg)] hover:bg-[var(--inset-bg)]'
                      : 'opacity-60'
                } ${isActive ? 'is-active' : ''} ${isDone ? 'is-complete' : ''}`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  {/* Step Icon / Dot */}
                  <div 
                    className={`orchestrator-step-dot relative z-10 w-6 h-6 rounded-full border text-[11px] font-mono font-bold flex items-center justify-center transition-all duration-150 ease-in-out ${
                      isDone 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                        : isActive 
                          ? 'border-[var(--accent-color)] bg-[var(--panel-bg)] text-[var(--accent-color)] font-extrabold shadow-sm'
                          : 'border-[var(--border-color)] text-[var(--muted-text)] bg-[var(--inset-bg)]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isActive ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  
                  {/* Step name */}
                  <span className={`text-xs font-medium tracking-tight ${
                    isDone || isActive ? 'text-[var(--text-color)] font-semibold' : 'text-[var(--muted-text)]'
                  }`}>
                    {step.label}
                  </span>
                </div>

                {/* Badge indicator */}
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border relative z-10 ${
                  isDone 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                    : isActive 
                      ? 'bg-[var(--active-bg)] border-[var(--accent-border)] text-[var(--accent-color)] animate-pulse'
                      : 'bg-[var(--inset-bg)] border-[var(--border-color)] text-[var(--muted-text)]'
                }`}>
                  {isDone ? "Completed" : isActive ? "Running" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Status log console message */}
        <div className="bg-[var(--inset-bg)] border border-[var(--border-color)] p-3 rounded-lg transition-all duration-150 ease-in-out shadow-inner">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-[var(--muted-text)] uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-[var(--accent-color)]" />
              Status Log
            </span>
          </div>
          <p className="font-mono text-[11px] text-[var(--text-color)] leading-relaxed break-words">
            {message || "Awaiting task execution..."}
          </p>
        </div>

      </div>

    </div>
  );
}
