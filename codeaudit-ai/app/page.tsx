"use client";

import { useState, useRef, useEffect } from "react";
import CodeEditor from "@/components/CodeEditor";
import AgentStatus from "@/components/AgentStatus";
import ReviewResults from "@/components/ReviewResults";
import { ReviewResult, StatusMessage, WebSocketMessage } from "@/types";

export default function Dashboard() {
  const [code, setCode] = useState<string>('def calculate_sum(n):\n    result = 0\n    for i in range(n):\n        for j in range(n):\n            result += i + j\n    return result\n');
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  // State for streaming UI
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [statusNode, setStatusNode] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Idle');
  
  // Final Results
  const [result, setResult] = useState<ReviewResult | null>(null);

  const startReview = () => {
    setIsEvaluating(true);
    setResult(null);
    setStatusNode('');
    setStatusMessage('Connecting to AI Orchestrator...');

    if (ws) ws.close();

    const socket = new WebSocket('ws://localhost:8000/api/ws/review');
    
    socket.onopen = () => {
      socket.send(JSON.stringify({
        source_code: code,
        language: "python"
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as WebSocketMessage;
      
      if (data.type === 'status') {
        setStatusNode(data.node);
        setStatusMessage(data.message);
      } else if (data.type === 'result') {
        setResult(data as ReviewResult);
        setCode(data.updated_code);
        setIsEvaluating(false);
        setStatusMessage('Review complete.');
        socket.close();
      } else if (data.type === 'error') {
        setStatusMessage(`Error: ${data.message || 'Something went wrong'}`);
        setIsEvaluating(false);
      }
    };

    socket.onerror = (error) => {
      setStatusMessage('WebSocket error. Is the FastAPI server running?');
      setIsEvaluating(false);
    };

    setWs(socket);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 flex flex-col">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Autonomous AI Code Review & Security Auditor
          </h1>
          <p className="text-gray-400 text-sm mt-1">Next.js + Monaco & FastAPI + LangGraph</p>
        </div>
        <button 
          onClick={startReview}
          disabled={isEvaluating}
          className="px-6 py-2 rounded-md font-semibold transition-all bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEvaluating ? 'Evaluating...' : 'Run Audit'}
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Editor Section (Left 3 cols) */}
        <section className="lg:col-span-3 flex flex-col">
          {result && result.updated_code !== result.original_code ? (
            <div className="flex-1 flex flex-col">
              <div className="mb-2 text-sm text-gray-400">Diff View (Original vs Optimized)</div>
              <CodeEditor 
                code={result.updated_code} 
                originalCode={result.original_code}
                onChange={() => {}} 
                diffMode={true} 
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
               <div className="mb-2 text-sm text-gray-400">Input Source Code</div>
              <CodeEditor 
                code={code} 
                onChange={(v) => setCode(v || '')} 
                readOnly={isEvaluating} 
              />
            </div>
          )}
        </section>

        {/* Status/Results Section (Right 1 col) */}
        <section className="flex flex-col gap-6">
          <AgentStatus 
            currentNode={statusNode} 
            message={statusMessage} 
            isComplete={!!result}
          />
          {result && (
            <div className="flex-1 min-h-[300px]">
              <ReviewResults 
                performance={result.performance_issues} 
                security={result.security_vulnerabilities}
                iterationCount={result.iteration_count}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
