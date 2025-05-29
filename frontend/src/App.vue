<script setup lang="ts">
import TokenExpiringModal from "@/components/TokenExpiringModal.vue";
import ScrollToTop from "@core/components/ScrollToTop.vue";
import initCore from "@core/initCore";
import { initConfigStore, useConfigStore } from "@core/stores/config";
import { hexToRgb } from "@core/utils/colorConverter";
import { useTheme } from "vuetify";

const { global } = useTheme();
initCore();
initConfigStore();
const configStore = useConfigStore();
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <VApp
      :style="`--v-global-theme-primary: ${hexToRgb(
        global.current.value.colors.primary
      )}`"
    >
      <RouterView />
      <ScrollToTop />
      <TokenExpiringModal />
    </VApp>
  </VLocaleProvider>
</template>
