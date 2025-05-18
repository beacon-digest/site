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

    resolve(Array.from(colors).slice(0, 3)); // Get up to 3 distinct colors
  });
};
