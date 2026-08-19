import type { GeneratedPalette, PaletteProject } from "../types";

interface FigmaColorToken {
  $extensions: {
    "com.figma.scopes": string[];
    "com.figma.hiddenFromPublishing": boolean;
  };
  $type: "color";
  $value: string;
}

export async function copyFigmaTokens(palettes: GeneratedPalette[]) {
  await navigator.clipboard.writeText(
    JSON.stringify(serializeFigmaTokens(palettes), null, 2),
  );
}

export function downloadProject(project: PaletteProject) {
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${safeFileName(project.name)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function serializeFigmaTokens(palettes: GeneratedPalette[]) {
  const output: Record<string, Record<string, FigmaColorToken>> = {};
  const names = new Map<string, number>();

  for (const palette of palettes) {
    const baseName = palette.name.trim() || "Color";
    const count = (names.get(baseName) ?? 0) + 1;
    names.set(baseName, count);
    const uniqueName = count === 1 ? baseName : `${baseName} ${count}`;

    output[uniqueName] = Object.fromEntries(
      palette.colors.map((color, index) => [
        String((index + 1) * 10),
        {
          $extensions: {
            "com.figma.scopes": ["ALL_SCOPES"],
            "com.figma.hiddenFromPublishing": true,
          },
          $type: "color",
          $value: color.hex,
        } satisfies FigmaColorToken,
      ]),
    );
  }

  return output;
}

function safeFileName(name: string) {
  return name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-") || "palette";
}
