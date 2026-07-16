export type Curve = "linear" | "ease";

export interface ChromaStop {
  step: number;

  value: number;
}

export interface Palette {
  id: string;

  name: string;

  hue: number;

  chromaStops: ChromaStop[];

  curve: Curve;
}

export interface PaletteProject {
  id: string;

  name: string;

  lightnessTop: number;

  lightnessBottom: number;

  steps: number;

  chromaMultiplier: number;

  palettes: Palette[];
}

export interface GeneratedColor {
  oklch: string;

  hex: string;

  text: string;

  border: string;

  apca: number;
}

export interface GeneratedPalette extends Palette {
  colors: GeneratedColor[];
}
