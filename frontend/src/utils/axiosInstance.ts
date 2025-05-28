import axios, { AxiosRequestConfig } from "axios";

// Crear una instancia única de Axios
const axiosInstance = axios.create({
  baseURL: "http://172.31.84.7:3000", // Cambia esto por la URL base de tu API
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 600000, // Tiempo de espera predeterminado
});

// Función para manejar configuraciones personalizadas
function customRequest(
  configOrUrl: string | AxiosRequestConfig,
  additionalConfig: AxiosRequestConfig = {}
) {
  let finalConfig: AxiosRequestConfig;

  if (typeof configOrUrl === "string") {
    // Si es un string, usar configuración predeterminada
    finalConfig = {
      url: configOrUrl,
      method: "post", // Método predeterminado
      data: {}, // Payload vacío por defecto
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 600000, // Tiempo de espera predeterminado
      ...additionalConfig, // Configuración adicional
    };
  } else {
    // Si es un objeto, hacer merge entre la configuración inicial y la proporcionada
    finalConfig = {
      ...configOrUrl,
      ...additionalConfig,
    };
  }

  // Realizar la solicitud con la configuración final
  return axiosInstance.request(finalConfig);
}

export { axiosInstance, customRequest };
