import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AgentStatusProps {
  currentNode: string;
  message: string;
  isComplete: boolean;
}

export default function AgentStatus({ currentNode, message, isComplete }: AgentStatusProps) {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    { name: "Triage", label: "Triage & Parse" },
    { name: "Performance", label: "Performance Audit" },
    { name: "Security", label: "Security Scan" },
    { name: "Lead Architect", label: "Lead Architect Refactor" },
  ];

  const stepNames = steps.map((s) => s.name);
  const activeIdx = stepNames.indexOf(currentNode);

  return (
    <div className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-lg p-4 sm:p-5 transition-all duration-150 ease-in-out">
      
      {/* Mobile Accordion Toggle Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex lg:hidden items-center justify-between w-full min-h-8 focus:outline-none"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">
          Live Orchestrator
        </span>
        <div className="text-[var(--muted-text)]">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Desktop static header */}
      <div className="hidden lg:flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)] flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            {!isComplete && activeIdx >= 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-color)] opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isComplete ? 'bg-emerald-500' : activeIdx >= 0 ? 'bg-[var(--accent-color)]' : 'bg-gray-400'}`}></span>
          </span>
          Live Orchestrator
        </span>
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
                className={`orchestrator-step relative flex items-center justify-between min-h-10 px-2 py-1.5 rounded-md transition-all duration-150 ease-in-out ${
                  isActive ? 'bg-[var(--active-bg)]' : ''
                } ${isActive ? 'is-active' : ''} ${isDone ? 'is-complete' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Numbered circle */}
                  <div 
                    className={`orchestrator-step-dot relative z-10 w-5 h-5 rounded-full border text-[10px] font-mono font-bold flex items-center justify-center transition-all duration-150 ease-in-out ${
                      isDone 
                        ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white' 
                        : isActive 
                          ? 'border-[var(--accent-color)] bg-[var(--panel-bg)] text-[var(--accent-color)]'
                          : 'border-[var(--border-color)] text-[var(--muted-text)]'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  
                  {/* Step name */}
                  <span className={`text-xs font-medium tracking-tight ${
                    isDone || isActive ? 'text-[var(--text-color)]' : 'text-[var(--muted-text)]'
                  }`}>
                    {step.label}
                  </span>
                </div>

                {/* Badge indicator */}
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  isDone 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                    : isActive 
                      ? 'bg-[var(--active-bg)] border-[var(--accent-border)] text-[var(--accent-color)]'
                      : 'bg-[var(--inset-bg)] border-[var(--border-color)] text-[var(--muted-text)]'
                }`}>
                  {isDone ? "Completed" : isActive ? "Running..." : "Pending"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Status log message */}
        <div className="bg-[var(--inset-bg)] border border-[var(--border-color)] border-l-2 border-l-[var(--accent-color)] p-3 rounded-md transition-all duration-150 ease-in-out">
          <div className="text-[9px] font-bold text-[var(--muted-text)] uppercase tracking-wider mb-1">
            Status Logs
          </div>
          <p className="font-mono text-[11px] text-[var(--text-color)] leading-relaxed break-words">
            {message || "Awaiting task execution..."}
          </p>
        </div>

      </div>

    </div>
  );
}
