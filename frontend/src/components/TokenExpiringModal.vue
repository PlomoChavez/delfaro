<script setup lang="ts">
import { useTokenExpiringModal } from "@/composables/useTokenExpiringModal";
const { showModal, hideTokenExpiringModal } = useTokenExpiringModal();
</script>

<template>
  <VDialog v-model="showModal" persistent max-width="400">
    <VCard>
      <VCardTitle>¡Tu sesión está por expirar!</VCardTitle>
      <VCardText>
        Por seguridad, tu sesión está a punto de expirar.<br />
        Por favor, guarda tu trabajo o renueva tu sesión.
      </VCardText>
      <VCardActions>
        <VBtn color="primary" @click="hideTokenExpiringModal">Cerrar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
