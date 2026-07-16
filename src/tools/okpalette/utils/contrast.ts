import Color from "colorjs.io";

export interface ContrastResult {
  text: string;
  apca: number;
}

/**
 * Converts any CSS color (OKLCH, HEX, RGB...) to HEX.
 */
export function toHex(color: string): string {
  return new Color(color).to("srgb").toString({
    format: "hex",
  });
}

/**
 * Calculates APCA against black and white
 * and returns the better text color.
 */
export function getContrast(color: string): ContrastResult {
  const background = new Color(color);

  const black = Math.abs(background.contrast("black", "APCA"));

  const white = Math.abs(background.contrast("white", "APCA"));

  return {
    text: black > white ? "#000" : "#fff",

    apca: Math.max(black, white),
  };
}

/**
 * Convenience wrapper.
 */
export function getTextColor(color: string): string {
  return getContrast(color).text;
}

/**
 * Convenience wrapper.
 */
export function getAPCA(color: string): number {
  return getContrast(color).apca;
}

/**
 * Small badge used in the UI.
 */
export function getAPCARating(apca: number): string {
  if (apca >= 90) {
    return "Excellent";
  }

  if (apca >= 75) {
    return "Good";
  }

  if (apca >= 60) {
    return "Fair";
  }

  return "Poor";
}

export function getBorderColor(color: string): string {
  const c = new Color(color);

  return c
    .to("oklch")
    .set({
      l: Math.max(0, c.oklch.l - 0.12),
    })
    .toString();
}
