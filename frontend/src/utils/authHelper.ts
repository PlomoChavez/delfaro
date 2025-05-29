import { router } from "@/plugins/1.router";

export function handleLogOut(redirect = true) {
  // Aquí puedes implementar la lógica de cierre de sesión
  console.log("Cerrar sesión");
  localStorage.removeItem("token");
  localStorage.removeItem("userData");
  if (redirect) {
    router.push({ name: "login" });
  }
}
