import React, { useEffect, useState } from "react";
import Badge from "../components/Badge";
import { Link } from "react-router-dom";
import Task from "../components/Task";
import { showToast } from "../helper/showToast";

const TaskListPage = () => {
  const [referesh, setReferesh] = useState(false);
  const [tasks, setTasks] = useState();
  const [filteredTasks, setFilteredTasks] = useState();
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    setReferesh(false);
    const getTask = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/task/get-all-task`
      );
      const responseData = await response.json();
      setTasks(responseData);
      setFilteredTasks(responseData);
    };
    getTask();
  }, [referesh]);

  useEffect(() => {
    if (!tasks) return;

    let result = tasks.taskData;

    // Filtrar por estado
    if (filters.status) {
      result = result.filter((task) => task.status === filters.status);
    }

    // Filtrar por texto (título o descripción)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por rango de fechas
    if (filters.dateFrom || filters.dateTo) {
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

      result = result.filter((task) => {
        if (!task.dueDate) return true; // Si no tiene fecha, no se filtra

        const taskDate = new Date(task.dueDate);

        if (fromDate && taskDate < fromDate) return false;
        if (toDate && taskDate > toDate) return false;

        return true;
      });
    }

    setFilteredTasks({ ...tasks, taskData: result });
  }, [filters, tasks]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const deleteTask = async (taskid) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/task/delete-task/${taskid}`,
        {
          method: "DELETE",
        }
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message);
      }
      setReferesh(true);
      showToast("success", responseData.message);
    } catch (error) {
      showToast("error", error.message);
    }
  };

  return (
    <div className="pt-5">
      <h1 className="text-2xl font-bold mb-5">MIS TAREAS</h1>

      {/* Filtros */}
      <div className="mb-5 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Estado
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="">Todos los estados</option>
              <option value="Pending">Pendiente</option>
              <option value="Running">En progreso</option>
              <option value="Completed">Completadas</option>
              <option value="Failed">Falladas</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Busqueda
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Buscar por titulo"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              de :
            </label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              A:
            </label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
        </div>
      </div>

      {filteredTasks && filteredTasks.status ? (
        filteredTasks.taskData.length > 0 ? (
          filteredTasks.taskData.map((task) => (
            <Task key={task._id} props={task} onDelete={deleteTask} />
          ))
        ) : (
          <>No se encontraron tareas con esos patrones .</>
        )
      ) : (
        <>Cargando</>
      )}
    </div>
  );
};

export default TaskListPage;
