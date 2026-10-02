import type { ComponentType } from "react";
import type { TileColor } from "../components/IconTile";
import * as Scenes from "./scenes";

export type SceneName = keyof typeof Scenes;
/** Small animated pictures that explain a topic at a glance. */
export const SCENES: Record<SceneName, ComponentType<{ color?: TileColor }>> = Scenes;
export { Illustration } from "./Illustration";
