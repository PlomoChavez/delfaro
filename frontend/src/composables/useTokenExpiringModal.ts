import { ref } from "vue";

const showModal = ref(false);

export function useTokenExpiringModal() {
  function showTokenExpiringModal() {
    showModal.value = true;
  }
  function hideTokenExpiringModal() {
    showModal.value = false;
  }
  return { showModal, showTokenExpiringModal, hideTokenExpiringModal };
}
