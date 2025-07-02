import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { HiRefresh, HiTerminal, HiCloudUpload } from "react-icons/hi";
import { FiLoader } from "react-icons/fi";
import { toast } from "sonner";

type Service = {
  _id: string;
  name: string;
  desc?: string;
  pm2_id: number;
  deploy_script_path?: string;
  assignedUsers: { username: string; _id: string }[];
};

const ServiceCard: React.FC<{
  svc: Service;
  userRole: string | undefined;
  onAction: (type: "restart" | "deploy" | "logs", id: string) => void;
  isPending: boolean;
}> = ({ svc, userRole, onAction, isPending }) => (
  <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/90 border border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col gap-6 transition hover:ring-2 hover:ring-blue-900/40">
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-white">{svc.name}</span>
          {userRole === "admin" && (
            <span className="ml-2 px-2 py-0.5 rounded bg-blue-800 text-blue-200 text-xs font-semibold">
              Admin
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          PM2 ID: <b className="text-gray-200">{svc.pm2_id}</b>
        </div>
        {svc.desc && (
          <div className="text-sm text-gray-300 mt-2">{svc.desc}</div>
        )}
      </div>
    </div>
    <div className="flex gap-2">
      <button
        className="flex-1 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500 text-yellow-200 font-semibold flex items-center justify-center gap-2 transition hover:bg-yellow-500/20 hover:border-yellow-400 focus:ring-2 focus:ring-yellow-700 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={() => onAction("restart", svc._id)}
        disabled={isPending}
        aria-label="Restart"
      >
        {isPending ? <FiLoader className="animate-spin" /> : <HiRefresh />}
        Restart
      </button>
      <button
        className="flex-1 px-3 py-2 rounded-lg bg-gray-800/70 border border-gray-700 text-gray-200 font-semibold flex items-center justify-center gap-2 transition hover:bg-gray-700/80 hover:border-blue-700 focus:ring-2 focus:ring-blue-900 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={() => onAction("logs", svc._id)}
        disabled={isPending}
        aria-label="View Logs"
      >
        <HiTerminal />
        Logs
      </button>
      <button
        className="flex-1 px-3 py-2 rounded-lg bg-green-600/10 border border-green-600 text-green-200 font-semibold flex items-center justify-center gap-2 transition hover:bg-green-600/20 hover:border-green-400 focus:ring-2 focus:ring-green-900 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={() => onAction("deploy", svc._id)}
        disabled={isPending}
        aria-label="Deploy"
      >
        <HiCloudUpload />
        Deploy
      </button>
    </div>
    {svc.assignedUsers && svc.assignedUsers.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-1">
        <span className="text-xs text-gray-500">Assigned:</span>
        {svc.assignedUsers.map((u) => (
          <span
            key={u._id}
            className="bg-gray-900 border border-gray-700 text-gray-200 rounded px-2 py-0.5 text-xs font-medium"
          >
            {u.username}
          </span>
        ))}
      </div>
    )}
  </div>
);

const LogPanel: React.FC<{
  logs: string;
  onClose: () => void;
  loading: boolean;
}> = ({ logs, onClose, loading }) => (
  <div className="fixed inset-0 z-50 flex">
    <div className="fixed inset-0 bg-black/70" onClick={onClose} />
    <div className="relative ml-auto w-full max-w-2xl h-full bg-gray-950 border-l border-gray-800 shadow-2xl flex flex-col animate-slide-left">
      <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <div className="text-lg font-semibold text-gray-100">Service Logs</div>
        <button
          className="p-2 rounded-md hover:bg-gray-800 text-gray-400"
          onClick={onClose}
          title="Close"
        >
          <svg width={20} height={20} fill="none">
            <path
              d="M6 6l8 8M6 14L14 6"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-gray-950">
        {loading ? (
          <div className="flex flex-col items-center mt-24 gap-2">
            <FiLoader className="text-3xl text-gray-600 animate-spin" />
            <span className="text-gray-400 text-sm">Loading logs…</span>
          </div>
        ) : (
          <pre className="text-xs font-mono text-green-300 bg-black rounded-lg p-3 max-h-[60vh] overflow-auto whitespace-pre leading-relaxed shadow-inner">
            {logs}
          </pre>
        )}
      </div>
    </div>
    <style>
      {`
        @keyframes slide-left {
          from { transform: translateX(100%);}
          to { transform: translateX(0);}
        }
        .animate-slide-left {
          animation: slide-left 0.28s cubic-bezier(.4,0,.2,1);
        }
      `}
    </style>
  </div>
);

const DashboardPage: React.FC = () => {
  const { api, user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [logView, setLogView] = useState<{
    id: string;
    logs: string;
    loading: boolean;
  } | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api("/api/services")
      .then((res) => setServices(res.services))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(type: "restart" | "deploy" | "logs", id: string) {
    if (type === "logs") {
      setLogView({ id, logs: "", loading: true });
      const resp = await api(`/api/services/${id}/logs`);
      setLogView({
        id,
        logs: typeof resp === "string" ? resp : JSON.stringify(resp, null, 2),
        loading: false,
      });
    } else {
      setPendingId(id);
      try {
        await api(`/api/services/${id}/${type}`, { method: "POST" });
        toast.success(
          type === "restart"
            ? "Restarted successfully."
            : "Deploy script executed (if configured)."
        );
      } catch (e) {
        toast.error("Action failed.");
      }
      setPendingId(null);
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Sidebar />
      <main className="flex-1 px-10 py-10 overflow-y-auto">
        <h1 className="text-3xl font-extrabold mb-8 text-white tracking-wide">
          Your Services
        </h1>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <FiLoader className="text-4xl text-gray-600 animate-spin mb-2" />
            <div className="text-gray-400 text-lg">Loading services…</div>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-6xl mb-2">🗂️</div>
            <div className="text-gray-400 text-lg">No assigned services.</div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {services.map((svc) => (
              <ServiceCard
                key={svc._id}
                svc={svc}
                userRole={user?.role}
                onAction={handleAction}
                isPending={pendingId === svc._id}
              />
            ))}
          </div>
        )}
        {logView && (
          <LogPanel
            logs={logView.logs}
            loading={logView.loading}
            onClose={() => setLogView(null)}
          />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
