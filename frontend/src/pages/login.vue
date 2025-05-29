<script setup lang="ts">
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import { useTokenExpiringModal } from "@/composables/useTokenExpiringModal"; // o tu función de modal
import { router } from "@/plugins/1.router";
import { customRequest } from "@/utils/axiosInstance";
import { startTokenTimer } from "@/utils/verifyToken";
import { useGenerateImageVariant } from "@core/composable/useGenerateImageVariant";
import loginDelFaro from "@images/delfaro/avatars/login.png";
import iconoDelFaro from "@images/delfaro/icono.png";
import authV2LoginIllustrationBorderedDark from "@images/pages/auth-v2-login-illustration-bordered-dark.png";
import authV2LoginIllustrationBorderedLight from "@images/pages/auth-v2-login-illustration-bordered-light.png";
import authV2LoginIllustrationDark from "@images/pages/auth-v2-login-illustration-dark.png";
import authV2LoginIllustrationLight from "@images/pages/auth-v2-login-illustration-light.png";
import authV2MaskDark from "@images/pages/misc-mask-dark.png";
import authV2MaskLight from "@images/pages/misc-mask-light.png";

definePage({
  meta: {
    layout: "blank",
    public: true,
  },
});

const form = ref({
  email: "jesus@gmail.com",
  password: "Demo123",
  remember: false,
});

async function handleLogin() {
  let response: any = await customRequest({
    url: "/api/login",
    method: "POST",
    data: form.value,
  });
  console.log("Response from login:", response);
  if (response.data.result) {
    const userData = response.data.data.userData;
    const token = response.data.data.token;

    if (userData && token) {
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("token", token);
      console.log("startTokenTimer");
      startTokenTimer(() => {
        console.log("¡Token expirado o inválido!");
        useTokenExpiringModal(); // Muestra el modal si el token es inválido o expiró
      });
      router.push({ name: "root" });
    } else {
      showErrorMessage({
        title: "Error",
        message: "No se recibió información de usuario o token válida.",
      });
    }
  } else {
    // Maneja el error de inicio de sesión

    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
    console.log("Error al iniciar sesión:", response.data.message);
  }
  // Redirige a la página principal o dashboard
}

const isPasswordVisible = ref(false);

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true
);

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark);
</script>

<template>
  <a href="javascript:void(0)">
    <div class="auth-logo d-flex align-center gap-x-3">
      <!-- <VNodeRenderer :nodes="themeConfig.app.logo" /> -->
      <img
        :src="iconoDelFaro"
        class="auth-logo-img"
        alt="logo"
        height="200px"
      />
    </div>
  </a>

  <VRow no-gutters class="auth-wrapper bg-surface">
    <VCol md="8" class="d-none d-md-flex">
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 6.25rem"
        >
          <VImg
            max-width="613"
            :src="loginDelFaro"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <img
          class="auth-footer-mask flip-in-rtl"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-6">
        <VCardText>
          <h4 class="text-h4 mb-1">Bienvenido a DelFaro v2.0 ! 👋🏻</h4>
          <p class="mb-0">
            Por favor, introduce tus credenciales para acceder al sistema.
            <br />
          </p>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="handleLogin">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  autofocus
                  label="Correo electrónico"
                  type="email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  label="Contraseña"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div
                  class="d-flex align-center flex-wrap justify-space-between my-6"
                >
                  <VCheckbox v-model="form.remember" label="Recuerdame" />
                  <a class="text-primary" href="javascript:void(0)">
                    Forgot Password?
                  </a>
                </div>

                <VBtn block type="submit"> Login </VBtn>
              </VCol>

              <VCol cols="12" class="text-body-1 text-center">
                <span class="d-inline-block"> Nuevo en la plataforma? </span>
                <span class="d-inline-block">
                  Contactate con soporte para que te den tus credenciales
                </span>
              </VCol>

              <!-- 
                <VCol cols="12" class="text-body-1 text-center">
                  <span class="d-inline-block"> New on our platform? </span>
                  <a
                    class="text-primary ms-1 d-inline-block text-body-1"
                    href="javascript:void(0)"
                  >
                    Create an account
                  </a>
                </VCol>

                <VCol cols="12" class="d-flex align-center">
                  <VDivider />
                  <span class="mx-4">or</span>
                  <VDivider />
                </VCol>

              
                <VCol cols="12" class="text-center">
                  <AuthProvider />
                </VCol> 
              -->
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
