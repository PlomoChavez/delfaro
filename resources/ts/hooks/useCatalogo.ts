import { ref } from "vue";

export function useCatalogo() {
  const opciones = ref<any[]>([]);
  const cargando = ref(false);
  const error = ref<string | null>(null);

  const obtenerCatalogo = async (item: any) => {
    cargando.value = true;
    error.value = null;

    try {
      let data: any = null;
      let url: any = "";

      // prettier-ignore
      switch (item.catalogo) {
        case "tipos-usuarios": url = "/api/catalogos/tipos-usuarios"; break;
      }

      const response = await customRequest(url);
      data = response.data.data;
      opciones.value = item.formatCatalogo ? item.formatCatalogo(data) : data;
    } catch (err) {
      error.value = "Error al cargar el catálogo.";
      console.error(err);
    } finally {
      cargando.value = false;
    }
    return opciones.value;
  };

  return {
    obtenerCatalogo,
  };
}
