import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "@fontsource-variable/lexend";
import "./style.css";

const storedTheme = localStorage.getItem("nyt-color-tools-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

document.documentElement.dataset.theme =
  storedTheme === "sweet-dark" || (storedTheme !== "sweet-light" && prefersDark)
    ? "sweet-dark"
    : "sweet-light";

createApp(App).use(router).mount("#app");
