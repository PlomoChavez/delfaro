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
        case "tipos-usuarios":    url = "/api/catalogos/tipos-usuarios"; break;
        case "companias":         url = "/api/catalogos/companias"; break;
        case "formas-pagos":      url = "/api/catalogos/formas-pagos"; break;
        case "tipo-vencimiento":  url = "/api/catalogos/tipo-vencimiento"; break;
        case "metodos-pago":      url = "/api/catalogos/metodos-pago"; break;
        case "moneda":            url = "/api/catalogos/moneda"; break;
        case "estatus-polizas":   url = "/api/catalogos/estatus-polizas"; break;
      }

      const response = await customRequest(url);
      data = response.data.data;
      if (!item.formatCatalogo) {
        let config = {
          label: "label",
          fullInfo: false,
        };
        if (item.config) {
          config = { ...config, ...item.config };
        }
        data = data.map((item: any) => {
          if (config.fullInfo) {
            return {
              ...item,
              label: item[config.label],
              id: item.id,
            };
          } else {
            return {
              label: item[config.label],
              id: item.id,
            };
          }
        });
      }

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
