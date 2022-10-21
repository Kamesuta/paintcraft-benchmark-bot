import * as mineflayer from "mineflayer";
import navigatePlugin from "mineflayer-navigate";
import * as vec3 from "vec3";

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
    navigatePlugin()(this.bot);
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
    return new Promise((resolve, reject) => {
      // 一旦すべての移動を停止
      this.stop();
      // イベントリスナーを登録
      this.registerListener(resolve, reject);
      this.bot.navigate.to(position);
    });
  }

  /**
   * パスに沿って移動する
   *
   * @param path 移動パス
   */
  public async movePath(path: Vec3[]): Promise<void> {
    return new Promise((resolve, reject) => {
      // 一旦すべての移動を停止
      this.stop();
      // イベントリスナーを登録
      this.registerListener(resolve, reject);
      this.bot.navigate.walk(path);
    });
  }

  /**
   * イベントリスナーを登録
   * @param resolve 成功
   * @param reject 失敗
   */
  private registerListener(
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: string) => void
  ) {
    this.bot.navigate.once("arrived", () => resolve());
    this.bot.navigate.once("cannotFind", (reason) =>
      reject(`cannotFind: ${reason}`)
    );
    this.bot.navigate.once("interrupted", (reason) =>
      reject(`interrupted: ${reason}`)
    );
    this.bot.navigate.once("obstructed", (reason) =>
      reject(`obstructed: ${reason}`)
    );
  }

  /**
   * 停止する
   */
  public stop(): void {
    this.bot.navigate.emit("interrupted");
    this.bot.navigate.removeAllListeners();
    this.bot.navigate.stop();
  }
}
