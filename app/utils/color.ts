// Vibrant preset gradients for neutral emoji colors
const VIBRANT_PRESETS = [
  ["#FF6B6B", "#4ECDC4", "#45B7D1"], // Coral to teal to blue
  ["#96CEB4", "#FFEAA7", "#DDA0DD"], // Mint to yellow to plum
  ["#74B9FF", "#A29BFE", "#FD79A8"], // Blue to purple to pink
  ["#FDCB6E", "#E17055", "#6C5CE7"], // Orange to coral to purple
  ["#00B894", "#00CEC9", "#55A3FF"], // Green to cyan to blue
  ["#FF7675", "#FDCB6E", "#6C5CE7"], // Red to yellow to purple
  ["#A29BFE", "#FD79A8", "#FDCB6E"], // Purple to pink to yellow
  ["#74B9FF", "#00B894", "#FDCB6E"], // Blue to green to orange
];

// Check if a color is neutral (grayscale or very low saturation)
const isNeutralColor = (r: number, g: number, b: number): boolean => {
  // Check if it's grayscale (RGB values are close to each other)
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

  // If RGB values are within 30 of each other, consider it neutral
  return maxDiff < 30;
};

// Check if the majority of extracted colors are neutral
const areColorsNeutral = (colors: string[]): boolean => {
  let neutralCount = 0;

  colors.forEach((color) => {
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbaMatch) {
      const [, r, g, b] = rgbaMatch.map(Number);
      if (isNeutralColor(r, g, b)) {
        neutralCount++;
      }
    }
  });

  return neutralCount >= colors.length * 0.7; // If 70% or more colors are neutral
};

export const getEmojiColors = (emoji: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 50;
    canvas.height = 50;

    // Draw emoji on canvas
    ctx!.font = "40px serif";
    ctx!.fillText(emoji, 10, 35);

    // Sample colors from different points
    const imageData = ctx!.getImageData(0, 0, 50, 50).data;
    const colors = new Set<string>();

    // Sample every 10th pixel
    for (let i = 0; i < imageData.length; i += 40) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];

      if (a > 0) {
        // Only consider non-transparent pixels
        colors.add(`rgba(${r}, ${g}, ${b}, 0.5)`);
      }
    }

    const extractedColors = Array.from(colors).slice(0, 3);

    // If extracted colors are mostly neutral, use a random vibrant preset
    if (extractedColors.length === 0 || areColorsNeutral(extractedColors)) {
      const randomPreset =
        VIBRANT_PRESETS[Math.floor(Math.random() * VIBRANT_PRESETS.length)];

      resolve(randomPreset.map((color) => `${color}88`));
    } else {
      resolve(extractedColors);
    }
  });
};
