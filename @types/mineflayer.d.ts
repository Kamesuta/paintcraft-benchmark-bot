import "mineflayer";

declare module "mineflayer" {
  import { Navigate } from "mineflayer-navigate";

  export interface Bot {
    navigate: Navigate;
  }
}
