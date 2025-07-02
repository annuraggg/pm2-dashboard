import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import { FiLoader } from "react-icons/fi";

type Log = {
  _id: string;
  userId: { username: string } | string;
  action: string;
  timestamp: string;
  details?: any;
};

const PAGE_SIZE = 50;

const AdminLogsPage: React.FC = () => {
  const { api } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api(`/api/logs?limit=${PAGE_SIZE}&page=${page}`)
      .then((res) => {
        setLogs(res.logs);
      })
      .catch(() => {
        toast.error("Failed to load logs.");
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-extrabold mb-6 text-white tracking-wide">
          Action Logs
        </h1>
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-800 rounded-2xl shadow-lg p-4">
          {loading ? (
            <div className="py-10 text-center text-gray-400 flex flex-col items-center">
              <FiLoader className="text-3xl animate-spin mb-2" />
              Loading...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No logs found for this page.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/60">
                    <th className="p-2 text-left font-semibold text-gray-300">
                      Time
                    </th>
                    <th className="p-2 text-left font-semibold text-gray-300">
                      User
                    </th>
                    <th className="p-2 text-left font-semibold text-gray-300">
                      Action
                    </th>
                    <th className="p-2 text-left font-semibold text-gray-300">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-t border-gray-800 hover:bg-gray-900/60 transition"
                    >
                      <td className="p-2 whitespace-nowrap text-gray-300">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-2 text-gray-200">
                        {typeof log.userId === "object"
                          ? log.userId.username
                          : String(log.userId)}
                      </td>
                      <td className="p-2 text-gray-100">{log.action}</td>
                      <td className="p-2 font-mono max-w-xs break-words">
                        {log.details ? (
                          <pre className="whitespace-pre-wrap text-xs bg-gray-950/80 text-green-300 border border-gray-800 rounded p-2">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-between mt-6">
            <button
              className="px-4 py-1.5 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 disabled:opacity-50 transition"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-xs text-gray-400 font-semibold">
              Page {page}
            </span>
            <button
              className="px-4 py-1.5 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 disabled:opacity-50 transition"
              onClick={() => setPage((p) => p + 1)}
              disabled={logs.length < PAGE_SIZE}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogsPage;
