import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";

// Import Bootstrap CSS and JS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Import custom CSS
import "./assets/css/app.css";
import "./assets/css/enhanced-settings.css";

// Create app instance
const app = createApp(App);

// Use plugins
app.use(createPinia());
app.use(router);

// Global error handler
app.config.errorHandler = (error, instance, info) => {
  console.error("Global error:", error);
  console.error("Component instance:", instance);
  console.error("Error info:", info);
};

// Mount app
app.mount("#app");
