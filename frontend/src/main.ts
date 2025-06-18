import { createApp } from "vue";

import App from "@/App.vue";
import { registerPlugins } from "@core/utils/plugins";
import Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";

// Styles
import "@core/scss/template/index.scss";
import "@styles/styles.css";
import "@styles/styles.scss";

// Create vue app
const app = createApp(App);

// Register plugins
app.use(Toastify);

registerPlugins(app);

// Mount vue app
app.mount("#app");
