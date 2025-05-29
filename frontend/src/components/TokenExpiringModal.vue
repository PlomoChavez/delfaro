<script setup lang="ts">
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import { useTokenExpiringModal } from "@/composables/useTokenExpiringModal";
import { handleLogOut } from "@/utils/authHelper";
import { ref, watch } from "vue";

const { showModal, hideTokenExpiringModal, showTokenExpiringModal } =
  useTokenExpiringModal();

const userData = JSON.parse(localStorage.getItem("userData") || "{}");
const email = ref("");
const password = ref("");
const isPasswordVisible = ref(false);
const loginError = ref("");

// Cada vez que el modal se abre, toma el correo actualizado de localStorage
watch(
  () => showModal,
  (newValue) => {
    console.log("Modal visibility changed:", newValue);
    if (newValue) {
      email.value = userData.correo || "";
      password.value = "";
      loginError.value = "";
    }
  }
);

const handleMakelogin = () => {
  loginError.value = "";
  if (!email.value || !password.value) {
    loginError.value = "Debes ingresar correo y contraseña.";
    return;
  }
  handleLogin();
};

const handleCerrar = () => {
  hideTokenExpiringModal();
  handleLogOut();
};

async function handleLogin() {
  let response: any = await customRequest({
    url: "/api/login",
    method: "POST",
    data: {
      email: email.value,
      password: password.value,
    },
  });
  if (response.data.result) {
    const userData = response.data.data.userData;
    const token = response.data.data.token;

    if (userData && token) {
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("token", token);
      startTokenTimer(() => {
        showTokenExpiringModal();
      });
      hideTokenExpiringModal();
    } else {
      showErrorMessage({
        title: "Error",
        message: "No se recibió información de usuario o token válida.",
      });
    }
  } else {
    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
}
</script>

<template>
  <VDialog v-model="showModal" persistent max-width="400">
    <VCard>
      <VCardTitle>Tu sesión ha finalizado</VCardTitle>
      <VCardText>
        <p class="text-center">
          Tu sesión ha expirado por seguridad.<br />
          Ingresa tu contraseña para renovar la sesión o haz clic en "Cerrar
          sesión" para salir.
        </p>

        <VAlert
          v-if="loginError"
          type="error"
          class="mb-2"
          density="compact"
          variant="tonal"
          :icon="false"
        >
          {{ loginError }}
        </VAlert>
        <pre>{{ email }}</pre>
        <pre>{{ password }}</pre>
        <VForm @submit.prevent="handleMakelogin">
          <VRow>
            <!-- email -->
            <VCol class="colItem" cols="12">
              <VTextField
                v-model="email"
                autofocus
                label="Correo electrónico"
                type="email"
                placeholder="johndoe@email.com"
              />
            </VCol>

            <!-- password -->
            <VCol class="colItem" cols="12">
              <VTextField
                v-model="password"
                label="Contraseña"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                autocomplete="password"
                :append-inner-icon="
                  isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                "
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>
            <VCol
              cols="12"
              class="colItem d-flex justifyBetween align-center gap-2"
            >
              <VBtn color="secondary" @click="handleCerrar">
                Cerrar sesión
              </VBtn>
              <VBtn type="submit" color="primary">Renovar sesión</VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.justifyBetween {
  justify-content: space-between;
}
.text-error {
  color: #f44336;
  font-size: 0.95em;
}
.colItem {
  padding-bottom: 8px !important;
  padding-top: 8px !important;
}
</style>
