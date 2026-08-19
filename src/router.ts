import { createRouter, createWebHistory } from "vue-router";
import type { Component } from "vue";
import type { RouteRecordRaw } from "vue-router";

type ToolEntry = {
  path: string;
  name: string;
  component: Component;
  label: string;
};

export const toolRoutes: ToolEntry[] = [];

const modules = import.meta.glob("@/tools/*/[A-Z]*.vue", { eager: true });
const labels: Record<string, string> = {
  home: "Home",
  okpalette: "Figma Design System Palette",
  gradient: "Gradient Steps",
  quickpalette: "Quick Palette",
};
const toolOrder = ["home", "gradient", "quickpalette", "okpalette"];

for (const [path, module] of Object.entries(modules)) {
  const match = path.match(/\/tools\/(.+?)\//);
  const name = match?.[1] ?? "tool";
  const label = labels[name] ?? name.charAt(0).toUpperCase() + name.slice(1);
  const component = (module as { default: Component }).default;

  toolRoutes.push({
    path: `/${name.toLowerCase()}`,
    name,
    label,
    component,
  });
}

toolRoutes.sort((a, b) => {
  const aIndex = toolOrder.indexOf(a.name);
  const bIndex = toolOrder.indexOf(b.name);
  return (
    (aIndex === -1 ? toolOrder.length : aIndex) -
    (bIndex === -1 ? toolOrder.length : bIndex)
  );
});

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/home" },
  ...toolRoutes.map(({ path, name, component }) => ({
    path,
    name,
    component,
  })),
  { path: "/:pathMatch(.*)*", redirect: "/home" },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.afterEach((to) => {
  const tool = toolRoutes.find((entry) => entry.name === to.name);
  document.title = tool ? `${tool.label} · NYT Color Tools` : "NYT Color Tools";
});

export default router;
