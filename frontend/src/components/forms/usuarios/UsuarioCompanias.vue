<script lang="ts" setup>
// prettier-ignore
import { ref } from "vue";
const clavesAgente = ref<any>(null);

const permisosGenerales = ref([
  {
    label: "cotizar",
    slug: "Cotizar",
    permiso: false,
  },
  {
    label: "Registrar Polizas",
    slug: "registrar_polizas",
    permiso: false,
  },
  {
    label: "Editar Polizas",
    slug: "editar_polizas",
    permiso: false,
  },
  {
    label: "Cancelar Polizas",
    slug: "cancelar_polizas",
    permiso: false,
  },
  {
    label: "Registrar Pagos",
    slug: "registrar_pagos",
    permiso: false,
  },
  {
    label: "Cancelar Pagos",
    slug: "cancelar_pagos",
    permiso: false,
  },
  {
    label: "Registrar endosos",
    slug: "registrar_endosos",
    permiso: false,
  },
]);

// Función para sincronizar permisos con el estado de la clave
function togglePermisos(item: any) {
  const newStatus = item.estatus === 1 || item.estatus === true;
  item.permisos.forEach((permiso: any) => {
    permiso.permiso = newStatus; // Activar o desactivar todos los permisos
  });
}

async function fetchTableData() {
  try {
    let url = "/api/usuario/claves/get";
    if (url != "") {
      let payload = {
        usuario_id: 5,
      };
      const response = await customRequest({
        url: url,
        method: "POST",
        data: payload,
      });
      let tmp = response.data.data;
      tmp = tmp.map((item: any) => {
        let t = { ...item, ...item.compania };
        t["permisos"] = permisosGenerales.value.map((permiso: any) => ({
          ...permiso, // Copiar cada permiso individualmente
        }));
        delete t.compania;
        delete t.created_at;
        delete t.updated_at;
        return t;
      });

      // Agrupar por compania_id
      const groupedData = tmp.reduce((acc: any, item: any) => {
        const key = item.compania_id;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {});

      clavesAgente.value = groupedData;
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}

onMounted(() => {
  fetchTableData();
});
</script>

<style scoped lang="scss">
.cardItem {
  min-width: 200px;
  background-color: #f7f7f7;
  width: fit-content;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.cardsWrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}
</style>

<template>
  <VExpansionPanels multiple>
    <VExpansionPanel v-for="(claves, i) in clavesAgente" :key="i">
      <!-- prettier-ignore -->
      <VExpansionPanelTitle> <strong>{{ claves[0]["nombreCorto"] }}</strong> </VExpansionPanelTitle>
      <VExpansionPanelText>
        <div class="cardsWrapper">
          <div v-for="(item, i) in [...claves]" :key="i" class="cardItem">
            <VCheckbox
              v-model="item.estatus"
              :label="item.clave"
              @change="togglePermisos(item)"
            />
            <div>
              <div
                v-for="(itemPermiso, index) in item.permisos"
                :key="index"
                class="ml-4"
              >
                <VCheckbox
                  v-model="itemPermiso.permiso"
                  :label="itemPermiso.label"
                  :disabled="item.estatus == 0"
                />
              </div>
            </div>
          </div>
        </div>
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>
