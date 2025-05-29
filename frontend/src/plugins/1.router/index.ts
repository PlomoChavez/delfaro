import navItems from "@/navigation/vertical";
import { setupLayouts } from "virtual:generated-layouts";
import type { App } from "vue";
import type { RouteRecordRaw } from "vue-router/auto";
import { createRouter, createWebHistory } from "vue-router/auto";
function findNavItemByName(items: any[], name: string): any | undefined {
  for (const item of items) {
    if (item.to && item.to.name === name) {
      return item;
    }
    if (item.children && Array.isArray(item.children)) {
      const found = findNavItemByName(item.children, name);
      if (found) return found;
    }
  }
  return undefined;
}
function getRequiresAuth(item: any): boolean {
  return item.config && typeof item.config.requiresAuth === "boolean"
    ? item.config.requiresAuth
    : false;
}
function thisHasRequiresAuth(name: string): boolean {
  const item = findNavItemByName(navItems, name);
  return item ? getRequiresAuth(item) : false;
}
function recursiveLayouts(route: RouteRecordRaw): RouteRecordRaw {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i]);
    return route;
  }
  return setupLayouts([route])[0];
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 60 };
    return { top: 0 };
  },
  extendRoutes: (pages) => [
    {
      path: "/",
      redirect: { name: "login" }, // Redirige a la ruta de login
    },
    ...[...pages].map((route) => recursiveLayouts(route)),
  ],
});

// --- AQUÍ VA EL GUARD ---
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const requiresAuth = thisHasRequiresAuth(to.name);
  console.log("Ruta a la que se intenta acceder:", to.name);
  // Si ya está autenticado y va a login, redirige a home
  if (to.name === "login" && isAuthenticated) {
    console.log("Tienes sesión activa, redirigiendo a home");
    return next({ name: "home" });
  }

  // Si la ruta requiere auth y no está autenticado, redirige a login
  if (requiresAuth && !isAuthenticated) {
    console.log("No tienes sesión activa, redirigiendo a login");
    return next({ name: "login" });
  }

  // Si va a login y no está autenticado, permite el acceso
  // Si la ruta no requiere auth, permite el acceso
  return next();
});
// --- FIN GUARD ---

export { router };

export default function (app: App) {
  app.use(router);
}
