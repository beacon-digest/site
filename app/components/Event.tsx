import { Group } from "@mantine/core";
import { EmojiBox } from "./EmojiBox";
import { IconArrowRight } from "@tabler/icons-react";

interface EventProps {
  emoji: string;
  location: string;
  address?: string;
  title: string;
  time: string;
}

export const Event: React.FC<EventProps> = ({
  emoji,
  location,
  address,
  title,
  time,
}) => {
  return (
    <div className="border-t border-gray-300 py-10">
      <div className="grid grid-cols-[auto_1fr_300px_auto] items-center gap-10">
        <EmojiBox emoji={emoji} />

        <div className="flex flex-col gap-0">
          <span className="text-gray-700 text-md">{time}</span>

          <h2 className="text-[34px] font-extrabold line-clamp-2 leading-12">
            {title}
          </h2>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-gray-800 text-xl">{location}</div>
          {address && <div className="text-gray-500 text-xl">{address}</div>}
        </div>

        <a
          href="#"
          className="text-red-600 text-xl flex items-center gap-1 whitespace-nowrap"
        >
          Learn more
          <IconArrowRight className="text-black" />
        </a>
      </div>
    </div>
  );
};
