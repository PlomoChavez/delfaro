<script lang="ts" setup>
// prettier-ignore
import { ref } from "vue";
const clavesAgente = ref<any>(null);

const permisosGenerales = ref([
  {
    slug: "cotizar",
    label: "Cotizar",
    permiso: false,
  },
  {
    slug: "Registrar Polizas",
    label: "registrar_polizas",
    permiso: false,
  },
  {
    slug: "Editar Polizas",
    label: "editar_polizas",
    permiso: false,
  },
  {
    slug: "Cancelar Polizas",
    label: "cancelar_polizas",
    permiso: false,
  },
  {
    slug: "Registrar Pagos",
    label: "registrar_pagos",
    permiso: false,
  },
  {
    slug: "Cancelar Pagos",
    label: "cancelar_pagos",
    permiso: false,
  },
  {
    slug: "Registrar endosos",
    label: "registrar_endosos",
    permiso: false,
  },
]);

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
        t["permisos"] = [...permisosGenerales.value];
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
<template>
  <VExpansionPanels multiple>
    <VExpansionPanel v-for="(claves, i) in clavesAgente" :key="i">
      <!-- prettier-ignore -->
      <VExpansionPanelTitle> <strong>{{ claves[0]["nombreCorto"] }}</strong> </VExpansionPanelTitle>
      <VExpansionPanelText>
        <div v-for="(item, i) in claves" :key="i">
          <VCheckbox v-model="item.estatus" :label="item.clave" />
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
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>
</template>
