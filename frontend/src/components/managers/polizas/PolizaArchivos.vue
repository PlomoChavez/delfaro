<script lang="ts" setup>
// Props y eventos
const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "cancelar"): void;
  (event: "changePanel", idx?: any): void;
}>();

const getNombreArchivo = (index: any) => {
  switch (index) {
    case 0:
      return "Responsabilidad social";
    case 1:
      return "Recibos de pago";
    case 2:
      return "Poliza de seguro";
    default:
      return "Archivo desconocido";
  }
};
</script>

<template>
  <div class="d-flex mb-6">
    <VIcon :icon="'tabler-license'" size="40" />
    <h1 class="pl-4 my-auto fontBold">Archivos</h1>
  </div>
  <!-- <pre>{{ props.data }}</pre> -->
  <div class="divWrapper">
    <div v-for="(archivo, indx) in props.data.archivos" :key="indx">
      <VCard class="rounded-lg w400 mb-4">
        <div class="divItems">
          <!-- Ícono del archivo -->
          <VAvatar :size="42" rounded="xl" :color="'#164c97'" variant="tonal">
            <VIcon :icon="'tabler-file'" size="26" :color="'#164c97'" />
          </VAvatar>

          <!-- Nombre del archivo -->
          <div class="ml-4 flex-grow">
            <h3 class="text-lg font-bold mb-1">{{ getNombreArchivo(indx) }}</h3>
            <p class="text-sm text-muted">Archivo relacionado</p>
          </div>

          <!-- Botón de descarga -->
          <div>
            <a
              :href="archivo.url"
              target="_blank"
              rel="noopener"
              class="btn-icon"
              :title="'Descargar PDF'"
            >
              <VAvatar size="32" rounded="xl" color="primary" variant="tonal">
                <VIcon icon="tabler-download" size="20" color="#164c97" />
              </VAvatar>
            </a>
          </div>
        </div>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.divWrapper {
  width: 100%;
  gap: 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.divItems {
  width: 100%;
  background-color: #f5f5f5; /* Cambia el color de fondo a algo más suave */
  display: flex;
  align-items: center; /* Centra los elementos verticalmente */
  justify-content: space-between; /* Espacia los elementos horizontalmente */
  padding: 10px; /* Agrega un poco de espacio interno */
  border-radius: 8px; /* Bordes redondeados para un diseño más moderno */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Sombra ligera para destacar */
}

.divItems:hover {
  transform: translateY(-2px); /* Efecto de elevación al pasar el mouse */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Sombra más pronunciada */
}

h3 {
  margin: 0;
}

.btn-icon {
  text-decoration: none;
}
</style>
