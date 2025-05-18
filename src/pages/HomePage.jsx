import React, { useState } from "react";
import { z, ZodError } from "zod";
import { getZodError } from "../helper/getZodError";
import { showToast } from "../helper/showToast";

const HomePage = () => {
  const [formData, setFormData] = useState({
    status: "Pending", // Valor por defecto
  });
  const [err, setError] = useState();

  const taskSchema = z.object({
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 character long." }),
    description: z
      .string()
      .min(3, { message: "Description must be at least 3 character long." })
      .max(500, { message: "Lenght acceeded." }),
    status: z.enum(["Pending", "Running", "Completed", "Failed"]),
    dueDate: z.string().refine(
      (val) => {
        if (!val) return true; // Opcional
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "Invalid date format" }
    ),
  });

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validatedData = taskSchema.parse(formData);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/task/create-task`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(validatedData),
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message);
      }
      setFormData({ status: "Pending" }); // Resetear con valor por defecto
      showToast("success", responseData.message);
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
      <h1 className="text-2xl font-bold mb-5">AGREGAR TAREA</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Titulo
          </label>
          <input
            value={formData?.title || ""}
            onChange={handleInput}
            name="title"
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Titulo de la tarea"
            required
          />
          {err && err.title && (
            <span className="text-red-500 text-sm">{err.title}</span>
          )}
        </div>
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Descripcion
          </label>
          <textarea
            value={formData?.description || ""}
            onChange={handleInput}
            name="description"
            rows="4"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descripcion de la tarea"
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
            value={formData?.status || "Pending"}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Pending">Pendiente</option>
            <option value="Running">En progreso</option>
            <option value="Completed">Completado</option>
            <option value="Failed">Fallado</option>
          </select>
          {err && err.status && (
            <span className="text-red-500 text-sm">{err.status}</span>
          )}
        </div>
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Fecha limite (Opcional)
          </label>
          <input
            value={formData?.dueDate || ""}
            onChange={handleInput}
            name="dueDate"
            type="date"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
          {err && err.dueDate && (
            <span className="text-red-500 text-sm">{err.dueDate}</span>
          )}
        </div>

        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          Registrar Tarea
        </button>
      </form>
    </div>
  );
};

export default HomePage;
