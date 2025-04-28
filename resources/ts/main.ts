import { createApp } from "vue";

import App from "@/App.vue";
import { registerPlugins } from "@core/utils/plugins";

import VueTheMask from "vue-the-mask";
// Styles
import "@core-scss/template/index.scss";
import "@styles/styles.scss";

// Create vue app
const app = createApp(App);
app.use(VueTheMask);

// Register plugins
registerPlugins(app);

// Mount vue app
app.mount("#app");
