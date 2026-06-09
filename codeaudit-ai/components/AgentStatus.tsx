import { Loader2, CheckCircle2 } from "lucide-react";

interface AgentStatusProps {
  currentNode: string;
  message: string;
  isComplete: boolean;
}

export default function AgentStatus({ currentNode, message, isComplete }: AgentStatusProps) {
  const steps = ["Triage", "Performance", "Security", "Lead Architect"];

  return (
    <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">Live Agent Graph</h3>
      <div className="space-y-4">
        {steps.map((step) => {
          const isActive = currentNode === step && !isComplete;
          const isDone = isComplete || steps.indexOf(currentNode) > steps.indexOf(step) || (currentNode === "Lead Architect" && isComplete);
          
          return (
            <div key={step} className={`flex items-center space-x-3 ${isActive ? 'text-blue-400' : isDone ? 'text-green-400' : 'text-gray-500'}`}>
              {isActive ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isDone ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-inherit" />
              )}
              <span className="font-medium">{step}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-700 text-sm text-gray-300">
        <p className="font-mono">{message || "Awaiting task..."}</p>
      </div>
    </div>
  );
}
