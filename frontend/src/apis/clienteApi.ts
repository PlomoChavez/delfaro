import { toast } from "vue3-toastify";

// Si tienes una función customRequest, impórtala aquí
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";

/**
 * Guarda o actualiza una cotización en el backend.
 * @param data Datos de la cotización
 * @param editando Si es edición (opcional)
 * @returns La respuesta del backend o null si hay error
 */
export const createCliente = async (data: any) => {
  try {
    const response = await customRequest({
      url: "/api/clientes/create",
      method: "POST",
      data: data,
    });
    const dataResponse = response.data;
    if (dataResponse.result) {
      toast.success("¡Cotización guardada!", { theme: "dark" });
      return {
        result: true,
        cliente: dataResponse.data,
      };
    } else {
      showErrorMessage({
        title: "Error",
        message: dataResponse.message,
      });
      return {
        result: false,
        message: dataResponse.message,
      };
    }
  } catch (error: any) {
    showErrorMessage({
      title: "Error",
      message: error?.message || "Error de conexión",
    });
    return {
      result: false,
      message: error?.message || "Error de conexión",
    };
  }
};
