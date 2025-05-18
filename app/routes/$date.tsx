import { createFileRoute, useParams } from "@tanstack/react-router";
import { Home } from "../components/Home";

const DateContainer = () => {
  const { date } = Route.useParams();

  return <Home date={date} />;
};

export const Route = createFileRoute("/$date")({
  component: DateContainer,
});
