<script lang="ts" setup>
import { calcularDiferenciaTiempo } from "@/utils/helper";
import { defineProps } from "vue";

const props = defineProps<{
  data?: any;
}>();
</script>
<template>
  <VCard title="Historial">
    <VCardText>
      <VTimeline
        side="end"
        align="start"
        line-inset="8"
        truncate-line="start"
        density="compact"
      >
        <!-- SECTION Timeline Item: Flight -->
        <VTimelineItem
          v-for="item in props.data"
          dot-color="primary"
          size="x-small"
        >
          <!-- 👉 Header -->
          <div
            class="d-flex justify-space-between align-center gap-2 flex-wrap mb-2"
          >
            <span class="app-timeline-title"> {{ item.accion }} </span>
            <span class="app-timeline-meta">{{
              calcularDiferenciaTiempo(item.created_at)
            }}</span>
          </div>

          <!-- 👉 Content -->
          <!-- <div class="app-timeline-text mt-1">
            Invoices have been paid to the company
          </div> -->
        </VTimelineItem>
      </VTimeline>
    </VCardText>
  </VCard>
</template>
