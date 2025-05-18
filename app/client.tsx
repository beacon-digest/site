import { StartClient } from "@tanstack/react-start";
/// <reference types="vinxi/types/client" />
import { hydrateRoot } from "react-dom/client";
import { createRouter } from "./router";
import "./tailwind.css";

const router = createRouter();

hydrateRoot(document, <StartClient router={router} />);
