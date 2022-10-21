import * as mineflayer from "mineflayer";
import { pathfinder, Movements } from "mineflayer-pathfinder";
import pathfinderModule from "mineflayer-pathfinder";
import * as vec3 from "vec3";
import minecraftData from "minecraft-data";

type Vec3 = vec3.Vec3;
const Vec3 = vec3.default;

/** 自動操作Bot */
export class BotAgent {
  /** ID */
  id: number;

  /** Botインスタンス */
  bot: mineflayer.Bot;

  /** パス */
  path: Vec3[] | null = null;

  /** 移動方法 */
  movements: Movements;

  /** 準備済み */
  ready: Promise<void>;

  /**
   * BotAgentを初期化しログインする
   *
   * @param id ID
   */
  constructor(id: number) {
    // IDを設定
    this.id = id;

    // Botを初期化してログイン
    this.bot = mineflayer.createBot({
      host: "localhost",
      username: `BotAgent${id}`,
      version: "1.16.5",
    });

    // エラーやキックの理由を表示する
    this.bot.on("kicked", (err) => console.log(`Kicked ${id}: ${err}`));
    this.bot.on("error", (err) => console.log(`Error ${id}: ${err}`));

    // ナビゲートプラグインをインストール
    this.bot.loadPlugin(pathfinder);
    // 移動方法を設定
    this.movements = new Movements(this.bot, minecraftData("1.16.5"));
    this.bot.pathfinder.setMovements(this.movements);
    // 準備完了フラグ
    this.ready = new Promise((resolve) => {
      this.bot.once("spawn", () => {
        resolve();
      });
    });
  }

  /**
   * 場所まで移動する
   *
   * @param position 移動先
   */
  public async moveTo(position: Vec3): Promise<void> {
    // 移動
    await this.bot.pathfinder.goto(
      new pathfinderModule.goals.GoalBlock(position.x, position.y, position.z)
    );
  }

  /**
   * パスに沿って移動する
   *
   * @param path 移動パス
   */
  public async movePath(path: Vec3[]): Promise<void> {
    // 移動
    for (const position of path) {
      await this.bot.pathfinder.goto(
        new pathfinderModule.goals.GoalBlock(position.x, position.y, position.z)
      );
    }
  }
}
