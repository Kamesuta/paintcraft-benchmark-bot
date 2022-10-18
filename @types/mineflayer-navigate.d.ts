declare module "mineflayer-navigate" {
  import { EventEmitter } from "events";
  import { Bot } from "mineflayer";
  import { Vec3 } from "vec3";

  export interface Node {
    point: Vec3;
    water: number;
  }

  export interface NavigateOptions {
    onArrived?: () => void;
    timeout?: number;
    endRadius?: number;
    tooFarThreshold?: number;
    isEnd: (node: Node) => boolean;
  }

  export interface Navigate extends EventEmitter {
    to(end: Vec3, options: NavigateOptions = null): void;
    stop(reason: string = null): void;
    walk(
      currentCourse: Vec3[],
      callback: (reason: string) => void = null
    ): void;
    findPathSync(end: Vec3, options: NavigateOptions = null): void;
    blocksToAvoid: { [key: string]: boolean };
  }

  export default function init(): (bot: Bot) => void;
}
