import * as mineflayer from "mineflayer";
import navigatePlugin from "mineflayer-navigate";
import * as vec3 from "vec3";

type Vec3 = vec3.Vec3;
const Vec3 = vec3.default;

class BotAgent {
  /** Botインスタンス */
  bot: mineflayer.Bot;

  /**
   * BotAgentを初期化しログインする
   *
   * @param id ID
   */
  constructor(id: number) {
    // Botを初期化してログイン
    this.bot = mineflayer.createBot({
      host: "localhost",
      username: `BotAgent${id}`,
    });

    // エラーやキックの理由を表示する
    this.bot.on("kicked", (err) => console.log(`Kicked ${id}: ${err}`));
    this.bot.on("error", (err) => console.log(`Error ${id}: ${err}`));

    // ナビゲートプラグインをインストール
    navigatePlugin()(this.bot);
    // 初期位置まで移動
    this.bot.once("spawn", () => {
      //this.moveTo(Vec3([0, 0, 0]));
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
      this.bot.navigate.emit("interrupted");
      this.bot.navigate.removeAllListeners();
      this.bot.navigate.stop();
      // イベントリスナーを登録
      this.bot.navigate.once("cannotFind", () => {
        reject();
      });
      this.bot.navigate.once("arrived", () => {
        resolve();
      });
      this.bot.navigate.once("interrupted", () => {
        reject();
      });
      this.bot.navigate.to(position);
    });
  }
}

const agent = new BotAgent(0);

// チャット入力時
agent.bot.on("chat", async (username, message) => {
  // navigate to whoever talks
  if (username === agent.bot.username) return;
  const target = agent.bot.players[username].entity;
  if (message === "come") {
    //agent.bot.navigate.to(target.position);
    await agent.moveTo(target.position).catch(() => {
      agent.bot.chat("I can't move to you");
    });
    agent.bot.chat("I'm here!");
  } else if (message === "stop") {
    agent.bot.navigate.stop();
  }
});
