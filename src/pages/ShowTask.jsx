import React, { useEffect, useState } from "react";
import { z, ZodError } from "zod";
import { getZodError } from "../helper/getZodError";
import { showToast } from "../helper/showToast";
import { useParams } from "react-router-dom";

const ShowTask = () => {
  const { taskid } = useParams();
  const [apiData, setApiData] = useState();
  const [formData, setFormData] = useState();
  const [err, setError] = useState();
  const [isCompleted, setIsCompleted] = useState(false);

  const taskSchema = z.object({
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 character long." }),
    description: z
      .string()
      .min(3, { message: "Description must be at least 3 character long." })
      .max(500, { message: "Length exceeded." }),
    status: z.enum(["Pending", "Running", "Completed", "Failed"]),
    dueDate: z.string().optional(),
  });

  const handleInput = (e) => {
    // Si está completada, no permitir cambios
    if (isCompleted) return;

    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const getTask = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/task/show-task/${taskid}`
      );
      const responseData = await response.json();
      setApiData(responseData);
      setFormData(responseData.taskData);
      setIsCompleted(responseData.taskData.status === "Completed");
    };
    getTask();
  }, [taskid]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si está completada, no permitir cambios
    if (isCompleted) {
      showToast("error", "Completed tasks cannot be modified");
      return;
    }

    try {
      // Validar transiciones de estado
      if (
        formData.status === "Running" &&
        apiData.taskData.status !== "Pending"
      ) {
        throw new Error("Only Pending tasks can be marked as Running");
      }

      if (
        formData.status === "Completed" &&
        apiData.taskData.status !== "Running"
      ) {
        throw new Error("Only Running tasks can be marked as Completed");
      }

      if (
        formData.status === "Pending" &&
        apiData.taskData.status !== "Pending"
      ) {
        throw new Error("Cannot return to Pending status");
      }

      const validatedData = taskSchema.parse(formData);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/task/update-task/${taskid}`,
        {
          method: "PUT",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(validatedData),
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message);
      }

      showToast("success", responseData.message);
      // Actualizar los datos después de la edición
      const updatedResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/task/show-task/${taskid}`
      );
      const updatedData = await updatedResponse.json();
      setApiData(updatedData);
      setIsCompleted(updatedData.taskData.status === "Completed");
    } catch (error) {
      if (error instanceof ZodError) {
        const getError = getZodError(error.errors);
        setError(getError);
      }
      showToast("error", error.message);
    }
  };

  return (
    <div className="pt-5">
      <h1 className="text-2xl font-bold mb-5">Task Details</h1>
      {apiData && apiData.status ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Title
            </label>
            <input
              value={formData?.title || ""}
              onChange={handleInput}
              name="title"
              type="text"
              className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                isCompleted ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              placeholder="Titulo de la tarea"
              required
              disabled={isCompleted}
            />
            {err && err.title && (
              <span className="text-red-500 text-sm">{err.title}</span>
            )}
          </div>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Description
            </label>
            <textarea
              value={formData?.description || ""}
              onChange={handleInput}
              name="description"
              rows="4"
              className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                isCompleted ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              placeholder="Descripcion de la tarea."
              disabled={isCompleted}
            ></textarea>
            {err && err.description && (
              <span className="text-red-500 text-sm">{err.description}</span>
            )}
          </div>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Estado
            </label>
            <select
              onChange={handleInput}
              name="status"
              value={formData?.status || ""}
              className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${
                isCompleted ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              disabled={isCompleted}
            >
              <option value="Pending">Pendiente</option>
              <option value="Running">En progreso</option>
              <option value="Completed">Completada</option>
              <option value="Failed">Fallada</option>
            </select>
            {err && err.status && (
              <span className="text-red-500 text-sm">{err.status}</span>
            )}
          </div>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Fecha de finalizacion
            </label>
            <input
              value={formData?.dueDate || ""}
              onChange={handleInput}
              name="dueDate"
              type="date"
              className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                isCompleted ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              disabled={isCompleted}
            />
            {err && err.dueDate && (
              <span className="text-red-500 text-sm">{err.dueDate}</span>
            )}
          </div>

          {!isCompleted && (
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
            >
              Tarea actualizada
            </button>
          )}
        </form>
      ) : (
        <>No se encontraron datos</>
      )}
    </div>
  );
};

export default ShowTask;
