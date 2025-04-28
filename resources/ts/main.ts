import { createApp } from "vue";

import App from "@/App.vue";
import { registerPlugins } from "@core/utils/plugins";
import money from "v-money3";

// Styles
import "@core-scss/template/index.scss";
import "@styles/styles.scss";

// Create vue app
const app = createApp(App);

// Registrar el plugin globalmente

// Register plugins
registerPlugins(app);
app.use(money);

// Mount vue app
app.mount("#app");
