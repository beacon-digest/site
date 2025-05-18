import { Box, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { getEmojiColors } from "../utils/color";

interface EmojiBoxProps {
  emoji: string;
}

export const EmojiBox: React.FC<EmojiBoxProps> = ({ emoji }) => {
  const [background, setBackground] = useState<string>("");

  useEffect(() => {
    getEmojiColors(emoji).then((colors) => {
      const gradient = `linear-gradient(135deg, ${colors.join(", ")})`;
      setBackground(gradient);
    });
  }, [emoji]);

  return (
    <Box
      className="w-39 h-39 bg-gray-300 rounded-xl flex items-center justify-center"
      style={{
        background,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <span className="text-6xl">{emoji}</span>
    </Box>
  );
};
