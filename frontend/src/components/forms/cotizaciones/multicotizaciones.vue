<script setup lang="ts">
import {
  showErrorMessage
} from "@/components/apps/sweetAlerts/SweetAlets";
import { customRequest } from "@/utils/axiosInstance";
const ramos :  any = ref(null); // Referencia al componente FormFactory

async function getRamos() {
  let url = "/api/catalogos/ramos";
  let response = await customRequest({
    url: url,
    method: "POST",
  });
  if (response.data.result) {
    ramos.value = response.data.data
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
}

onMounted(() => {
  getRamos();
});
</script>

<style scoped lang="scss">
.bgRed {
  background-color: red;
}

.w-full {
  width: 100%;
}
.divPlanes {
  display: flex;
  width: fit-content;
  margin-left: auto !important;
  margin-right: auto !important;
}
.w-fit {
  width: fit-content;
}

.divFechas {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 2rem;
}
.divPlanItem {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  align-items: center;
  width: fit-content;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  border-color: #ccc;
}
</style>

<template>
  <div class="w-full">
    <div  class="divPlanes" v-for="(ramo, index) in ramos">
      <div class="divPlanItem">{{ ramo.label }}</div>
    </div>
  </div>
</template>
