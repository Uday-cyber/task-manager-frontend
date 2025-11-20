import React, { useEffect, useState } from "react";
import axios from "axios";

// ==========================
// Axios Instance
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

const TextInput = ({ label, type = "text", value, onChange, placeholder }) => (
  <label className="block mb-4">
    <span className="text-sm text-slate-600">{label}</span>
    <input
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

const SubtleButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium underline-offset-2 hover:underline"
  >
    {children}
  </button>
);

const ErrorNote = ({ message }) => (
  <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm mb-4">
    {message}
  </div>
);

// ==========================
// Login Form
// ==========================
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
      } else setError("Wrong credentials");
    } catch {
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
            disabled={loading}
            className={cn(
              "rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 shadow-sm",
              loading && "opacity-70 cursor-not-allowed"
            )}
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

// ==========================
// Register Form
// ==========================
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
            disabled={loading}
            className={cn(
              "rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 shadow-sm",
              loading && "opacity-70 cursor-not-allowed"
            )}
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
// Task Row Component
// ==========================
const TaskRow = ({ task, onEdit, onDelete }) => (
  <tr className="border-b last:border-none">
    <td className="px-4 py-3">{task.title}</td>
    <td className="px-4 py-3 text-slate-600">{task.description}</td>
    <td className="px-4 py-3">
      {task.file ? (
        <a href={task.file} target="_blank" className="text-indigo-600 hover:underline">
          View
        </a>
      ) : (
        "—"
      )}
    </td>
    <td className="px-4 py-3">
      <span
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
          task.status === "completed"
            ? "bg-emerald-100 text-emerald-700"
            : task.status === "in-progress"
            ? "bg-amber-100 text-amber-700"
            : "bg-slate-100 text-slate-700"
        )}
      >
        {task.status}
      </span>
    </td>
    <td className="px-4 py-3 text-right">
      <button onClick={() => onEdit(task)} className="mr-2 border px-3 py-1.5 rounded-lg hover:bg-slate-50">
        Update
      </button>
      <button onClick={() => onDelete(task)} className="bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700">
        Delete
      </button>
    </td>
  </tr>
);

// ==========================
// Modal Component
// ==========================
const Modal = ({ open, title, children, onClose }) =>
  open ? (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose}>✕</button>
          </div>
          {children}
        </div>
      </div>
    </div>
  ) : null;

// ==========================
// Task Form
// ==========================
const TaskForm = ({ initial = {}, onSubmit, submitLabel = "Save" }) => {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [status, setStatus] = useState(initial.status || "pending");
  const [file, setFile] = useState(null);

  useEffect(() => {
    setTitle(initial.title || "");
    setDescription(initial.description || "");
    setStatus(initial.status || "pending");
  }, [initial]);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ title, description, status, file });
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <TextInput label="Title" value={title} onChange={(val) => setTitle(val)} />

      <label className="block">
        <span>Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full min-h-[100px] border rounded-xl px-3 py-2"
        />
      </label>

      <label className="block">
        <span>Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded-xl px-3 py-2"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </label>

      <label className="block">
        <span>File</span>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>

      <PrimaryButton type="submit" className="w-auto">
        {submitLabel}
      </PrimaryButton>
    </form>
  );
};


// ==========================
// TASKS SCREEN (Updated with Search, Filter, Pagination)
// ==========================
const TasksScreen = ({ onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState(null);

  // 🔵 UPDATED fetchTasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = { search, status: statusFilter, page, limit: 10 };

      const { data } = await API.get("/tasks", { params });

      setTasks(data.tasks || []);
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
    } catch {
      alert("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, page]);

  // CRUD Handlers
  const handleCreate = async ({ title, description, status, file }) => {
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("status", status);
      if (file) form.append("file", file);

      await API.post("/tasks", form);
      setOpenAdd(false);
      fetchTasks();
    } catch {
      alert("Failed to create");
    }
  };

  const handleUpdate = async ({ title, description, status, file }) => {
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("status", status);
      if (file) form.append("file", file);

      await API.put(`/tasks/${editing._id}`, form);
      setOpenEdit(false);
      fetchTasks();
    } catch {
      alert("Failed to update");
    }
  };

  const handleDelete = async (task) => {
    if (!confirm("Delete this task?")) return;

    try {
      await API.delete(`/tasks/${task._id}`);
      fetchTasks();
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-white border-b p-4 flex justify-between">
        <h1 className="text-xl font-bold">My Tasks</h1>
        <button
          className="bg-black text-white px-4 py-2 rounded-lg"
          onClick={() => {
            localStorage.removeItem("token");
            onLogout();
          }}
        >
          Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-4">

        {/* 🔍 SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-3">
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Search tasks..."
            className="border px-3 py-2 rounded-xl w-full md:w-64"
          />

          <select
            value={statusFilter}
            onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
            className="border px-3 py-2 rounded-xl"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <div className="text-sm text-slate-600 mt-1">
            Total: {total}
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-auto border rounded-xl bg-white">
            <table className="min-w-full">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">File</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {tasks.map((task) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    onEdit={(t) => { setEditing(t); setOpenEdit(true); }}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {pages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div>Page {page} of {pages}</div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="border px-3 py-1 rounded-lg disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="border px-3 py-1 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Floating Button */}
      <button
        onClick={() => setOpenAdd(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white px-4 py-3 rounded-full shadow-xl"
      >
        + Add Task
      </button>

      {/* Add Task Modal */}
      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Task">
        <TaskForm onSubmit={handleCreate} />
      </Modal>

      {/* Edit Task Modal */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)} title="Update Task">
        <TaskForm initial={editing || {}} onSubmit={handleUpdate} />
      </Modal>
    </div>
  );
};

// ==========================
// Root App
// ==========================
export default function App() {
  const [screen, setScreen] = useState(localStorage.getItem("token") ? "tasks" : "login");

  const goTasks = () => setScreen("tasks");
  const goLogin = () => setScreen("login");
  const goRegister = () => setScreen("register");

  if (screen === "login") return <LoginForm onSuccess={goTasks} onShowRegister={goRegister} />;
  if (screen === "register") return <RegisterForm onSuccess={goTasks} onShowLogin={goLogin} />;
  return <TasksScreen onLogout={goLogin} />;
}
