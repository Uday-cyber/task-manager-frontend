import API from "./api";

// CREATE TASK
export const createTask = (title, description) =>
  API.post("/tasks/", { title, description });

// GET ALL TASKS
export const getTasks = () => API.get("/tasks/");

// UPDATE TASK
export const updateTask = (id, updatedData) =>
  API.put(`/tasks/${id}`, updatedData);

// DELETE TASK
export const deleteTask = (id) =>
  API.delete(`/tasks/${id}`);
