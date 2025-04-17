import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

type ToolEntry = {
  path: string;
  name: string;
  component: any;
  label: string;
};

export const toolRoutes: ToolEntry[] = [];

const modules = import.meta.glob('@/tools/**/[A-Z]*.vue', { eager: true });

for (const [path, module] of Object.entries(modules)) {
  const match = path.match(/\/tools\/(.+?)\//);
  const name = match?.[1] ?? 'tool';
  const label = name.charAt(0).toUpperCase() + name.slice(1);

  toolRoutes.push({
    path: `/${name.toLowerCase()}`,
    name,
    label,
    component: (module as any).default,
  });
}

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: toolRoutes[0]?.path || '/stepforge' },
  ...toolRoutes.map(({ path, name, component }) => ({
    path,
    name,
    component,
  })),
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
