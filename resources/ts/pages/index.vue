<script setup lang="ts">
import avatarDelFaro from "@images/delfaro/avatars/dashboard.png";
</script>
<template>
  <div>
    <VCard class="mb-6" title="Proximamente🚀">
      <!-- 👉 Image -->
      <div class="misc-avatar w-100 text-center">
        <VImg
          :src="avatarDelFaro"
          alt="error 404"
          :max-height="$vuetify.display.smAndDown ? 350 : 500"
          class="mx-auto"
        />
      </div>
    </VCard>
  </div>
</template>
