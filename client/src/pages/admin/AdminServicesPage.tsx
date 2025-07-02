import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import { FiLoader, FiX } from "react-icons/fi";

// Custom styled checkbox for dark mode
const CustomCheckbox: React.FC<{
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <label className="inline-flex items-center cursor-pointer relative">
    <input
      type="checkbox"
      className="peer sr-only"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
    <span
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
        ${
          checked
            ? "border-blue-600 bg-blue-700/80"
            : "border-gray-600 bg-gray-900"
        }
        peer-focus:ring-2 peer-focus:ring-blue-600
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          viewBox="0 0 20 20"
          stroke="currentColor"
        >
          <path
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 10l4 4 6-7"
          />
        </svg>
      )}
    </span>
  </label>
);

// Custom styled input for dark mode
const CustomInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => (
  <input
    {...props}
    className={`
      w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100
      placeholder-gray-500 outline-none transition
      focus:ring-2 focus:ring-blue-600 focus:border-blue-600
      disabled:opacity-60
      ${props.className ?? ""}
    `}
  />
);

// Custom styled textarea for dark mode
const CustomTextarea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = (props) => (
  <textarea
    {...props}
    className={`
      w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100
      placeholder-gray-500 outline-none transition
      focus:ring-2 focus:ring-blue-600 focus:border-blue-600
      disabled:opacity-60
      ${props.className ?? ""}
    `}
  />
);

type Service = {
  _id: string;
  name: string;
  desc?: string;
  pm2_id: number;
  deploy_script_path?: string;
  assignedUsers: { _id: string; username: string }[];
};

type User = { _id: string; username: string; role: "team" | "admin" };

const ServiceFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: Partial<Service>;
  setForm: React.Dispatch<React.SetStateAction<Partial<Service>>>;
  editId: string | null;
  users: User[];
}> = ({ isOpen, onClose, onSubmit, form, setForm, editId, users }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-700 shadow-2xl rounded-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
          type="button"
        >
          <FiX size={22} />
        </button>
        <h2 className="text-xl font-bold text-white mb-4">
          {editId ? "Edit Service" : "Add Service"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <CustomInput
            type="text"
            placeholder="Service Name"
            value={form.name || ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <CustomTextarea
            placeholder="Description"
            value={form.desc || ""}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
          />
          <CustomInput
            type="number"
            placeholder="PM2 Process ID"
            value={form.pm2_id ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                pm2_id: parseInt(e.target.value, 10),
              }))
            }
            required
          />
          <CustomInput
            type="text"
            placeholder="Deploy Script Path (optional)"
            value={form.deploy_script_path || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, deploy_script_path: e.target.value }))
            }
          />
          <label className="block text-xs font-semibold text-gray-300 mt-2 mb-1">
            Assign Team Users
          </label>
          <div className="flex flex-wrap gap-3 mb-2 py-5">
            {users.map((u) => (
              <label
                key={u._id}
                className="flex items-center gap-2 text-xs text-gray-200"
              >
                <CustomCheckbox
                  checked={!!form.assignedUsers?.some((au) => au._id === u._id)}
                  onChange={(e) => {
                    setForm((f) => {
                      const assigned = f.assignedUsers || [];
                      if (e.target.checked)
                        return {
                          ...f,
                          assignedUsers: [...assigned, u],
                        };
                      else
                        return {
                          ...f,
                          assignedUsers: assigned.filter(
                            (au) => au._id !== u._id
                          ),
                        };
                    });
                  }}
                />
                {u.username}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              className="flex-1 bg-blue-700 hover:bg-blue-900 px-4 py-2 text-white rounded font-semibold transition"
              type="submit"
            >
              {editId ? "Update" : "Create"}
            </button>
            <button
              className="flex-1 bg-gray-700 hover:bg-gray-900 px-4 py-2 text-white rounded font-semibold transition"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminServicesPage: React.FC = () => {
  const { api } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Service>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load all services and users
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [servicesRes, usersRes] = await Promise.all([
          api("/api/admin/services"),
          api("/auth/users"),
        ]);
        setServices(servicesRes.services);
        setUsers(usersRes.users.filter((u: User) => u.role === "team"));
      } catch {
        toast.error("Failed to load services or users.");
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  const resetForm = () => {
    setForm({});
    setEditId(null);
    setShowModal(false);
  };

  // Add/Edit Service
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.pm2_id === undefined) {
      toast.error("Name and PM2 ID are required.");
      return;
    }
    try {
      if (editId) {
        await api(`/api/admin/services/${editId}`, {
          method: "PUT",
          data: {
            name: form.name,
            desc: form.desc,
            pm2_id: form.pm2_id,
            deploy_script_path: form.deploy_script_path,
            assignedUsers: form.assignedUsers?.map((u) => u._id),
          },
        });
        toast.success("Service updated.");
      } else {
        await api("/api/admin/services", {
          method: "POST",
          data: {
            name: form.name,
            desc: form.desc,
            pm2_id: form.pm2_id,
            deploy_script_path: form.deploy_script_path,
            assignedUsers: form.assignedUsers?.map((u) => u._id),
          },
        });
        toast.success("Service created.");
      }
      // Refresh list
      const s = await api("/api/admin/services");
      setServices(s.services);
      resetForm();
    } catch {
      toast.error("Operation failed.");
    }
  };

  // Start editing a service
  const startEdit = (svc: Service) => {
    setEditId(svc._id);
    setForm({
      name: svc.name,
      desc: svc.desc,
      pm2_id: svc.pm2_id,
      deploy_script_path: svc.deploy_script_path,
      assignedUsers: svc.assignedUsers,
    });
    setShowModal(true);
  };

  // Delete a service
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await api(`/api/admin/services/${id}`, { method: "DELETE" });
      setServices((svcs) => svcs.filter((s) => s._id !== id));
      toast.success("Service deleted.");
    } catch {
      toast.error("Delete failed.");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Sidebar />
      <ServiceFormModal
        isOpen={showModal}
        onClose={resetForm}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editId={editId}
        users={users}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            Services Management
          </h1>
          <button
            className="bg-blue-700 hover:bg-blue-900 px-4 py-2 text-white rounded font-semibold transition"
            onClick={() => {
              setEditId(null);
              setForm({});
              setShowModal(true);
            }}
          >
            Add Service
          </button>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/90 border border-gray-800 shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/60">
                <th className="p-3 text-left font-semibold text-gray-300">
                  Name
                </th>
                <th className="p-3 text-center font-semibold text-gray-300">
                  PM2 ID
                </th>
                <th className="p-3 text-center font-semibold text-gray-300">
                  Assigned Users
                </th>
                <th className="p-3 text-center font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    <FiLoader className="inline mr-2 animate-spin" />
                    Loading...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No services found.
                  </td>
                </tr>
              ) : (
                services.map((svc) => (
                  <tr
                    key={svc._id}
                    className="border-t border-gray-800 hover:bg-gray-900/60 transition"
                  >
                    <td className="p-3 align-middle">
                      <div className="font-semibold text-gray-100">
                        {svc.name}
                      </div>
                      <div className="text-xs text-gray-400">{svc.desc}</div>
                      {svc.deploy_script_path && (
                        <div className="text-xs text-blue-300 mt-1">
                          Deploy:{" "}
                          <span className="font-mono">
                            {svc.deploy_script_path}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center text-gray-200 align-middle">
                      {svc.pm2_id}
                    </td>
                    <td className="p-3 text-xs text-gray-200 text-center align-middle">
                      {svc.assignedUsers?.map((u) => u.username).join(", ") ||
                        "-"}
                    </td>
                    <td className="p-3 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="bg-blue-700 hover:bg-blue-900 px-2 py-1 text-xs text-white rounded transition"
                          onClick={() => startEdit(svc)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-700 hover:bg-red-900 px-2 py-1 text-xs text-white rounded transition"
                          onClick={() => handleDelete(svc._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminServicesPage;
