import { computed, ref, watch } from "vue";
import type { Palette, PaletteProject } from "../types";
import { normalizeChromaStops } from "../utils/chroma";

const STORAGE_KEY = "ok-palette-projects";
const ACTIVE_KEY = "ok-palette-active";

function createDefaultProject(): PaletteProject {
  return {
    id: crypto.randomUUID(),
    name: "New Palette",
    lightnessTop: 98,
    lightnessBottom: 18,
    steps: 12,
    lightnessCurve: "smooth",
    lightnessCurveFactor: 1.5,
    chromaMultiplier: 1,
    palettes: [
      {
        id: crypto.randomUUID(),
        name: "Blue",
        hue: 240,
        endHue: null,
        curve: "ease",
        chromaStops: [
          { id: crypto.randomUUID(), step: 0, value: 0.02 },
          { id: crypto.randomUUID(), step: 6, value: 0.18 },
          { id: crypto.randomUUID(), step: 11, value: 0.04 },
        ],
      },
    ],
  };
}

function loadProjects(): PaletteProject[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [createDefaultProject()];

  try {
    const projects = JSON.parse(raw) as PaletteProject[];
    if (!Array.isArray(projects) || projects.length === 0) {
      throw new Error("No projects found");
    }
    return projects.map(normalizeProject);
  } catch {
    return [createDefaultProject()];
  }
}

export function useProjects() {
  const projects = ref<PaletteProject[]>(loadProjects());
  const storedActiveId = localStorage.getItem(ACTIVE_KEY);
  const activeId = ref(
    projects.value.some((project) => project.id === storedActiveId)
      ? storedActiveId!
      : projects.value[0].id,
  );

  const currentProject = computed(
    () =>
      projects.value.find((project) => project.id === activeId.value) ??
      projects.value[0],
  );

  watch(
    projects,
    (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)),
    { deep: true },
  );

  watch(activeId, (value) => localStorage.setItem(ACTIVE_KEY, value));

  function selectProject(id: string) {
    if (projects.value.some((project) => project.id === id)) {
      activeId.value = id;
    }
  }

  function createProject() {
    const project = createDefaultProject();
    project.name = `Palette ${projects.value.length + 1}`;
    projects.value.push(project);
    selectProject(project.id);
  }

  function deleteProject(id: string) {
    if (projects.value.length <= 1) return;
    projects.value = projects.value.filter((project) => project.id !== id);
    selectProject(projects.value[0].id);
  }

  function importProject(project: PaletteProject) {
    const normalized = normalizeProject(project);
    normalized.id = crypto.randomUUID();
    normalized.palettes = normalized.palettes.map((palette) => ({
      ...palette,
      id: crypto.randomUUID(),
    }));
    projects.value.push(normalized);
    selectProject(normalized.id);
  }

  return {
    projects,
    currentProject,
    selectProject,
    createProject,
    deleteProject,
    importProject,
  };
}

function normalizeProject(project: PaletteProject): PaletteProject {
  if (
    !project ||
    typeof project !== "object" ||
    !Array.isArray(project.palettes)
  ) {
    throw new Error("Invalid palette project");
  }

  const steps = clampInteger(project.steps, 2, 30, 12);

  return {
    ...project,
    id: typeof project.id === "string" ? project.id : crypto.randomUUID(),
    name: cleanName(project.name, "Imported Palette"),
    lightnessTop: clampNumber(project.lightnessTop, 0, 100, 98),
    lightnessBottom: clampNumber(project.lightnessBottom, 0, 100, 18),
    steps,
    lightnessCurve: project.lightnessCurve === "linear" ? "linear" : "smooth",
    lightnessCurveFactor: clampNumber(project.lightnessCurveFactor, 1, 5, 1.5),
    chromaMultiplier: clampNumber(project.chromaMultiplier, 0, 1.5, 1),
    palettes: project.palettes.map((palette: Palette) => ({
      ...palette,
      id: typeof palette.id === "string" ? palette.id : crypto.randomUUID(),
      name: cleanName(palette.name, "Color"),
      hue: clampNumber(palette.hue, 0, 360, 180),
      endHue:
        palette.endHue === null || palette.endHue === undefined
          ? null
          : clampNumber(palette.endHue, 0, 360, 240),
      curve: palette.curve === "linear" ? "linear" : "ease",
      chromaStops: normalizeChromaStops(
        Array.isArray(palette.chromaStops)
          ? palette.chromaStops
              .filter(
                (stop) =>
                  stop &&
                  Number.isFinite(Number(stop.step)) &&
                  Number.isFinite(Number(stop.value)),
              )
              .map((stop) => ({
                id: stop.id ?? crypto.randomUUID(),
                step: Math.round(Number(stop.step)),
                value: clampNumber(stop.value, 0, 0.4, 0.02),
              }))
          : [],
        steps,
      ),
    })),
  };
}

function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(Math.max(number, min), max)
    : fallback;
}

function clampInteger(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
) {
  return Math.round(clampNumber(value, min, max, fallback));
}

function cleanName(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
