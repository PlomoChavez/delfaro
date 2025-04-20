import Swal from "sweetalert2";
export function showDeleteItem({
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Sí, eliminar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  Swal.fire({
    title,
    html: `
<p class="swal-description">${message}</p>
<div
  style="display: flex; justify-content: center; gap: 10px; margin-top: 20px"
>
        <button id="cancelButton" style="
          background-color: white;
          color: black;
          font-weight: bold;
          padding: 10px 20px;
          border: 2px solid black;
          border-radius: 5px;
          cursor: pointer;
        ">${cancelText}</button>
        <button id="confirmButton" style="
          background-color: #dc3545;
          color: white;
          font-weight: bold;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">${confirmText}</button>
      </div>
`,
    showConfirmButton: false,
    icon: "warning",
    showCancelButton: false,
    didRender: () => {
      const confirmButton = document.getElementById("confirmButton");
      const cancelButton = document.getElementById("cancelButton");
      confirmButton?.addEventListener("click", () => {
        Swal.close();
        onConfirm();
      });
      cancelButton?.addEventListener("click", () => {
        Swal.close();
        if (onCancel) onCancel();
      });
    },
  });
}
export function showSuccessMessage({
  title = "Eliminado",
  message = "El elemento ha sido eliminado con éxito.",
  confirmText = "Aceptar", // Solo el texto es personalizable
}: {
  title?: string;
  message?: string;
  confirmText?: string; // Texto personalizable para el botón de confirmación
}) {
  Swal.fire({
    title,
    html: `
      <p style="
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        margin-top: 0px;
        margin-bottom: 0px;
      ">
        ${message}
      </p>
    `,
    icon: "success",
    showConfirmButton: true,
    customClass: {
      confirmButton: "custom-confirm-button", // Clase personalizada para el botón
    },
    didRender: () => {
      const confirmButton = document.querySelector(".custom-confirm-button");
      if (confirmButton) {
        confirmButton.innerHTML = `<span style="font-weight: bold; color: white;">${confirmText}</span>`; // Solo el texto es dinámico
      }
    },
    confirmButtonColor: "#28C76F", // Verde para el botón de éxito
  });
}

// Swal.fire("Eliminado", "El elemento ha sido eliminado.", "success");
