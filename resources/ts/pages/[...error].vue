<script setup lang="ts">
import { useGenerateImageVariant } from "@core/composable/useGenerateImageVariant";
import avatarDelFaro from "@images/delfaro/avatars/preocupado.png";
import miscMaskDark from "@images/pages/misc-mask-dark.png";
import miscMaskLight from "@images/pages/misc-mask-light.png";

const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark);

definePage({
  alias: "/pages/misc/not-found/:error(.*)",
  meta: {
    layout: "blank",
    public: true,
  },
});
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      status-code="404"
      title="Pagina no encontrada ⚠️"
      description="No pudimos encontrar la página que estás buscando."
    />

    <VBtn to="/" class="mb-11"> Ir a inicio </VBtn>

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center">
      <VImg
        :src="avatarDelFaro"
        alt="error 404"
        :max-height="$vuetify.display.smAndDown ? 350 : 500"
        class="mx-auto"
      />
    </div>

    <img
      class="misc-footer-img d-none d-md-block"
      :src="authThemeMask"
      alt="misc-footer-img"
      height="320"
    />
  </div>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
