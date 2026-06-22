import { Box } from "@mantine/core";
import { useEffect, useState } from "react";
import { getEmojiColors } from "../utils/color";

interface EmojiBoxProps {
  emoji: string;
}

export const EmojiBox: React.FC<EmojiBoxProps> = ({ emoji }) => {
  const [background, setBackground] = useState<string>("");

  useEffect(() => {
    getEmojiColors(emoji).then((colors) => {
      if (colors.length > 0) {
        const gradient = `linear-gradient(135deg, ${colors.join(", ")})`;
        setBackground(gradient);
      }
    });
  }, [emoji]);

  return (
    <Box
      className="w-20 h-20 md:w-39 md:h-39 bg-gray-200 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-500"
      style={{
        background,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <span className="text-3xl md:text-6xl">{emoji}</span>
    </Box>
  );
};
