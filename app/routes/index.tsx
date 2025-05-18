import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../components/Home";
import { format } from "date-fns";

const IndexContainer = () => {
  return <Home date={format(new Date(), "yyyy-MM-dd")} />;
};

export const Route = createFileRoute("/")({
  component: IndexContainer,
});
