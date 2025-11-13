import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

// ==========================
// Axios Instance (Localhost)
// ==========================
const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ==========================
// Helpers
// ==========================
const cn = (...classes) => classes.filter(Boolean).join(" ");

// ==========================
// Auth Forms (Login / Register)
// ==========================
const CenterCard = ({ title, children, footer }) => (
  <div className="min-h-screen w-full grid place-items-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
    <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">{title}</h1>
      {children}
      {footer}
    </div>
  </div>
);

const TextInput = ({ label, type = "text", value, onChange, placeholder, name }) => (
  <label className="block mb-4">
    <span className="text-sm text-slate-600">{label}</span>
    <input
      name={name}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition"
    />
  </label>
);

const PrimaryButton = ({ children, onClick, type = "button", className = "" }) => (
  <button
    type={type}
    onClick={onClick}
    className={cn(
      "w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 shadow-sm",
      className
    )}
  >
    {children}
  </button>
);

const SubtleButton = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={cn(
      "text-sm text-indigo-600 hover:text-indigo-700 font-medium underline-offset-2 hover:underline",
      className
    )}
  >
    {children}
  </button>
);

const ErrorNote = ({ message }) => (
  <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm mb-4">
    {message}
  </div>
);

// Login Form
const LoginForm = ({ onSuccess, onShowRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      const { data } = await API.post("/users/login", { email, password });
      if (data?.token) {
        localStorage.setItem("token", data.token);
        onSuccess();
      } else {
        setError("Wrong credentials");
      }
    } catch (e) {
      setError("Wrong credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenterCard
      title="Login to Your Account"
      footer={
        <div className="mt-6 flex items-center justify-between">
          <SubtleButton onClick={onShowRegister}>Register new user</SubtleButton>
          <button
            onClick={handleLogin}
            className={cn(
              "rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 shadow-sm",
              loading && "opacity-70 cursor-not-allowed"
            )}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      }
    >
      {error && <ErrorNote message={error} />}
      <TextInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <TextInput label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
    </CenterCard>
  );
};

// Register Form
const RegisterForm = ({ onSuccess, onShowLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    if (!username || !email || !password) {
      setError("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      const { data } = await API.post("/users/register", { username, email, password });
      if (data) {
        // Many backends auto-login. If yours returns token, save it; else redirect to login.
        if (data.token) localStorage.setItem("token", data.token);
        onSuccess();
      }
    } catch (e) {
      setError(e?.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenterCard
      title="Create a New Account"
      footer={
        <div className="mt-6 flex items-center justify-between">
          <SubtleButton onClick={onShowLogin}>Back to Login</SubtleButton>
          <button
            onClick={handleRegister}
            className={cn(
              "rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 shadow-sm",
              loading && "opacity-70 cursor-not-allowed"
            )}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      }
    >
      {error && <ErrorNote message={error} />}
      <TextInput label="Username" value={username} onChange={setUsername} placeholder="uday" />
      <TextInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <TextInput label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
    </CenterCard>
  );
};

// ==========================
// Tasks UI
// ==========================
const TaskRow = ({ task, onEdit, onDelete }) => (
  <tr className="border-b last:border-none">
    <td className="px-4 py-3 whitespace-pre-wrap">{task.title}</td>
    <td className="px-4 py-3 text-slate-600 whitespace-pre-wrap">{task.description}</td>
    <td className="px-4 py-3">
      {task.file ? (
        <a href={`${import.meta.env.VITE_API_URL}/uploads/${task.file}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View</a>
      ) : (
        <span className="text-slate-400">—</span>
      )}
    </td>
    <td className="px-4 py-3">
      <span className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        task.status === "completed"
          ? "bg-emerald-100 text-emerald-700"
          : task.status === "in-progress"
          ? "bg-amber-100 text-amber-700"
          : "bg-slate-100 text-slate-700"
      )}>
        {task.status || "pending"}
      </span>
    </td>
    <td className="px-4 py-3 text-right">
      <button onClick={() => onEdit(task)} className="mr-2 rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 text-slate-700">Update</button>
      <button onClick={() => onDelete(task)} className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5">Delete</button>
    </td>
  </tr>
);

const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">✕</button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

const TaskForm = ({ initial = {}, onSubmit, submitting, submitLabel = "Save" }) => {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [status, setStatus] = useState(initial.status || "pending");
  const [file, setFile] = useState(null);

  useEffect((e) => {
    if(initial && initial._id){
      setTitle(initial.title ?? "");
      setDescription(initial.description ?? "");
      setStatus(initial.status ?? "");
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ title, description, status, file });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput label="Title" value={title} onChange={setTitle} placeholder="Task title" />
      <label className="block">
        <span className="text-sm text-slate-600">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full min-h-[100px] rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition"
          placeholder="Describe the task"
        />
      </label>

      <label className="block">
        <span className="text-sm text-slate-600">Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm text-slate-600">File (optional)</span>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1 block w-full" />
      </label>

      <div className="flex items-center justify-end gap-3 pt-2">
        <PrimaryButton type="submit" className={cn("w-auto", submitting && "opacity-70 cursor-not-allowed")}>
          {submitLabel}
        </PrimaryButton>
      </div>
    </form>
  );
};

const TasksScreen = ({ onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/tasks/");
      setTasks(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async ({ title, description, status, file }) => {
    try {
      const hasFile = Boolean(file);
      if (hasFile) {
        const form = new FormData();
        form.append("title", title);
        form.append("description", description);
        form.append("status", status);
        form.append("file", file);
        await API.post("/tasks/", form, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await API.post("/tasks/", { title, description, status });
      }
      setOpenAdd(false);
      await fetchTasks();
    } catch (e) {
      alert(e?.response?.data?.error || "Create failed");
    }
  };

  const handleUpdate = async ({ title, description, status, file }) => {
    if (!editing) return;
    try {
      const hasFile = Boolean(file);
      if (hasFile) {
        const form = new FormData();
        form.append("title", title);
        form.append("description", description);
        form.append("status", status);
        form.append("file", file);
        await API.put(`/tasks/${editing._id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await API.put(`/tasks/${editing._id}`, { title, description, status });
      }
      setOpenEdit(false);
      setEditing(null);
      await fetchTasks();
    } catch (e) {
      alert(e?.response?.data?.error || "Update failed");
    }
  };

  const handleDelete = async (task) => {
    if (!confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${task._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
    } catch (e) {
      alert("Delete failed");
    }
  };

  const table = (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr className="text-left text-slate-600 text-sm">
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 font-semibold">File</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {tasks.map((task) => (
            <TaskRow
              key={task._id}
              task={task}
              onEdit={(t) => {
                setEditing(t);
                setOpenEdit(true);
              }}
              onDelete={handleDelete}
            />
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                No tasks yet. Click **Add Task** to create one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">My Tasks</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTasks}
              className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                onLogout();
              }}
              className="rounded-lg bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {error && <ErrorNote message={error} />}
        {loading ? (
          <div className="grid place-items-center py-24 text-slate-500">Loading tasks…</div>
        ) : (
          <>{table}</>
        )}
      </main>

      {/* Option A: Bottom-Center Add Button (always visible on mobile) */}
      <div className="fixed inset-x-0 bottom-4 flex md:hidden items-center justify-center pointer-events-none">
        <button
          onClick={() => setOpenAdd(true)}
          className="pointer-events-auto rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xl px-6 py-3"
        >
          Add Task
        </button>
      </div>

      {/* Option B: Bottom-Right Floating (FAB) on md+ screens */}
      <button
        onClick={() => setOpenAdd(true)}
        className="hidden md:inline-flex fixed bottom-6 right-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl px-5 py-3 font-semibold"
        aria-label="Add Task"
      >
        + Add Task
      </button>

      {/* Add Modal */}
      <Modal open={openAdd} title="Add Task" onClose={() => setOpenAdd(false)}>
        <TaskForm onSubmit={handleCreate} submitLabel="Save" />
      </Modal>

      {/* Edit Modal */}
      <Modal open={openEdit} title="Update Task" onClose={() => { setOpenEdit(false); setEditing(null); }}>
        <TaskForm initial={editing || {}} onSubmit={handleUpdate} submitLabel="Save" />
      </Modal>
    </div>
  );
};

// ==========================
// Root App (Flow Controller)
// ==========================
export default function App() {
  const [screen, setScreen] = useState(() => (localStorage.getItem("token") ? "tasks" : "login"));

  const goTasks = () => setScreen("tasks");
  const goLogin = () => setScreen("login");
  const goRegister = () => setScreen("register");

  if (screen === "login") {
    return <LoginForm onSuccess={goTasks} onShowRegister={goRegister} />;
  }
  if (screen === "register") {
    return <RegisterForm onSuccess={goTasks} onShowLogin={goLogin} />;
  }
  return <TasksScreen onLogout={goLogin} />;
}

