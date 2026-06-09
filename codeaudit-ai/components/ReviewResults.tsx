import { ReviewIssue } from "@/types";

interface ReviewResultsProps {
  performance: ReviewIssue[];
  security: ReviewIssue[];
  iterationCount: number;
}

export default function ReviewResults({ performance, security, iterationCount }: ReviewResultsProps) {
  return (
    <div className="bg-gray-800 p-4 rounded-md border border-gray-700 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2 text-gray-100">Audit Results (Iterations: {iterationCount})</h3>
      
      <div className="mt-4">
        <h4 className="text-orange-400 font-medium mb-2 border-b border-gray-600 pb-1">Performance Issues</h4>
        {performance.length === 0 ? (
          <p className="text-gray-400 text-sm">No issues found.</p>
        ) : (
          <ul className="space-y-2">
            {performance.map((iss, idx) => (
              <li key={idx} className="bg-gray-900 p-2 rounded text-sm text-gray-300 flex justify-between items-start">
                <span>{iss.issue}</span>
                <span className={`text-xs px-2 py-1 rounded ml-2 ${iss.severity === 'high' || iss.severity === 'critical' ? 'bg-red-900/50 text-red-400' : 'bg-orange-900/50 text-orange-400'}`}>
                  {iss.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <h4 className="text-red-400 font-medium mb-2 border-b border-gray-600 pb-1">Security Vulnerabilities</h4>
        {security.length === 0 ? (
          <p className="text-gray-400 text-sm">No vulnerabilities found.</p>
        ) : (
          <ul className="space-y-2">
            {security.map((iss, idx) => (
              <li key={idx} className="bg-gray-900 p-2 rounded text-sm text-gray-300 flex justify-between items-start">
                <span>{iss.issue}</span>
                <span className={`text-xs px-2 py-1 rounded ml-2 ${iss.severity === 'high' || iss.severity === 'critical' ? 'bg-red-900/50 text-red-400' : 'bg-red-900/50 text-red-400'}`}>
                  {iss.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
