import navItems from "@/navigation/vertical";
import { handleLogOut } from "@/utils/authHelper";
import { customRequest } from "@/utils/axiosInstance";
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

function getRequiresAuth(item: any): any {
  return item.config && typeof item.config.requiresAuth === "boolean"
    ? item.config.requiresAuth
    : null;
}

async function verificarToken() {
  let token = localStorage.getItem("token") || "";
  console.log("Token from localStorage:", token);
  if (token != "") {
    let response: any = await customRequest({
      url: "/api/verificar",
      method: "POST",
      data: { token },
    });

    if (!response.data.result) {
      handleLogOut(false);
      return false;
    } else {
      return true;
    }
  } else {
    handleLogOut(false);
    return false;
  }

  // Redirige a la página principal o dashboard
}

function thisHasRequiresAuth(name: string): any {
  const item = findNavItemByName(navItems, name);
  return item
    ? getRequiresAuth(item) == null
      ? true
      : getRequiresAuth(item)
    : true;
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
router.beforeEach(async (to, from, next) => {
  await verificarToken();
  const isAuthenticated = !!localStorage.getItem("token");
  const requiresAuth = thisHasRequiresAuth(to.name);
  // Si es login y ya hay sesión, redirige a home
  if (to.name === "login") {
    if (isAuthenticated) {
      return next({ name: "root" });
    } else {
      return next();
    }
  } else {
    if (!requiresAuth) {
      return next();
    } else if (requiresAuth && isAuthenticated) {
      return next();
    } else if (requiresAuth && !isAuthenticated) {
      return next({ name: "login" });
    }
  }
  // En cualquier otro caso, permite el acceso
});
// --- FIN GUARD ---

export { router };

export default function (app: App) {
  app.use(router);
}
