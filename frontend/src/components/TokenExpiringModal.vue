<script setup lang="ts">
import { useTokenExpiringModal } from "@/composables/useTokenExpiringModal";
import { handleLogOut } from "@/utils/authHelper";
import { ref } from "vue";
const { showModal, hideTokenExpiringModal } = useTokenExpiringModal();

const userData = JSON.parse(localStorage.getItem("userData") || "{}");
const email = ref(userData.correo || "");
const password = ref("");
const isPasswordVisible = ref(false);
const loginError = ref("");

const handleLogin = () => {
  loginError.value = "";
  if (!email.value || !password.value) {
    loginError.value = "Debes ingresar correo y contraseña.";
    return;
  }
  // Aquí puedes manejar el inicio de sesión, por ejemplo, enviando los datos a tu API
  console.log("Iniciar sesión con:", {
    email: email.value,
    password: password.value,
  });
};
const handleCerrar = () => {
  hideTokenExpiringModal();
  handleLogOut();
};
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
        <VForm @submit.prevent="handleLogin">
          <VRow>
            <!-- email -->
            <VCol class="colItem" cols="12">
              <AppTextField
                v-model="email"
                autofocus
                label="Correo electrónico"
                type="email"
                placeholder="johndoe@email.com"
              />
            </VCol>

            <!-- password -->
            <VCol class="colItem" cols="12">
              <AppTextField
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
