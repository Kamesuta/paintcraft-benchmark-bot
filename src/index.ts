import * as vec3 from "vec3";
import { BotAgent } from "./botAgent.js";
import { generatePath } from "./pathGenerator.js";
import cluster, { Worker } from "cluster";

type Vec3 = vec3.Vec3;
const Vec3 = vec3.default;

if (cluster.isWorker) {
  let bot: BotAgent | null = null;

  process.on("message", async ({ message, data }) => {
    switch (message) {
      case "start":
        bot = new BotAgent(data.id);
        await bot.ready;
        if (process.send) {
          process.send({ message: "start" });
        }
        console.log("started!");
        break;
      case "move_to":
        await bot?.moveTo(data.pos);
        if (process.send) {
          process.send({ message: "move_to" });
        }
        break;
      case "move_path":
        await bot?.movePath(data.path);
        if (process.send) {
          process.send({ message: "move_path" });
        }
        break;
      case "stop":
        bot?.bot.pathfinder.stop();
        break;
    }
  });

  if (process.send) {
    process.send({ message: "ready" });
  }
} else {
  // 最初にログインするBot
  const agent = new BotAgent(0);
  // 最初と最後の位置を設定
  let position1 = Vec3([249, 64, 222]);
  let position2 = Vec3([251, 64, 224]);

  class Bot {
    id: number;
    worker: Worker;
    path?: vec3.Vec3[];
    ready: Promise<void>;

    constructor(id: number) {
      this.id = id;
      this.worker = cluster.fork();
      this.ready = new Promise((resolve) => {
        this.worker.once("message", ({ message }) => {
          if (message === "ready") {
            resolve();
          }
        });
      });
    }

    async start() {
      const promise = new Promise<void>((resolve) => {
        this.worker.once("message", ({ message }) => {
          if (message === "start") {
            resolve();
          }
        });
      });
      this.worker.send({ message: "start", data: { id: this.id } });
      return promise;
    }

    async moveTo(pos: Vec3) {
      const promise = new Promise<void>((resolve) => {
        this.worker.once("message", ({ message }) => {
          if (message === "move_to") {
            resolve();
          }
        });
      });
      this.worker.send({ message: "move_to", data: { pos } });
      return promise;
    }

    async movePath(path: Vec3[]) {
      const promise = new Promise<void>((resolve) => {
        this.worker.once("message", ({ message }) => {
          if (message === "move_path") {
            resolve();
          }
        });
      });
      this.worker.send({ message: "move_path", data: { path } });
      return promise;
    }

    stop() {
      this.worker.send({ message: "stop" });
    }
  }

  // ログインしているBot
  let bots: Bot[] = [];

  // スリープ
  const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

  // チャット入力時
  agent.bot.on("chat", async (username, message) => {
    // 自身の発言は無視
    if (username === agent.bot.username) return;
    // 発言者のエンティティを取得
    const target = agent.bot.players[username].entity;

    // チャットコマンド
    switch (message) {
      case "pos1":
        // 位置1を設定
        {
          position1 = target.position.clone().floor();
          agent.bot.chat(`pos1: ${position1}`);
        }
        break;

      case "pos2":
        // 位置2を設定
        {
          position2 = target.position.clone().floor();
          agent.bot.chat(`pos2: ${position2}`);
        }
        break;

      case "gen":
        // パステスト
        {
          // パスを作成
          agent.bot.chat(`パスを作成しています...`);
          const minPosition = position1.min(position2);
          const maxPosition = position1.max(position2);
          const size = maxPosition.minus(minPosition);
          const path = generatePath(minPosition, size);

          // パスを表示
          agent.bot.chat(`サイズ: ${size}`);
          agent.bot.chat(`パス:`);
          for (const p of path) {
            agent.bot.chat(` (${p.x}, ${p.z})`);
            await sleep(400);
          }
        }
        break;

      case "login":
        // ログイン済み
        {
          if (bots.length > 0) {
            agent.bot.chat("すでにログインしています");
            return;
          }

          // パスを作成
          agent.bot.chat(`パスを作成しています...`);
          const minPosition = position1.min(position2);
          const maxPosition = position1.max(position2);
          const size = maxPosition.minus(minPosition);
          const path = generatePath(minPosition, size);

          // ログイン
          agent.bot.chat(`ログインしています...`);
          bots = [...Array<number>(path.length).keys()]
            .filter((i) => i !== 0)
            .map((i: number) => new Bot(i));
          await Promise.all(bots.map((bot) => bot.ready));
          await Promise.all(bots.map((bot) => bot.start()));
          agent.bot.chat(`パスを登録中...`);
          for (const bot of bots) {
            const pos = path.shift();
            if (!pos) continue;
            path.push(pos);
            bot.path = [...path];
          }
          agent.bot.chat(`初期位置まで移動しています...`);
          await Promise.all(
            bots.map((bot) => {
              if (!bot.path) return;
              return bot.moveTo(bot.path[0]).catch((reason) => {
                agent.bot.chat(
                  `Bot${bot.id}の初期位置への移動に失敗しました: ${reason}`
                );
              });
            })
          );
          agent.bot.chat(`完了しました`);
        }

        break;

      case "move":
        // 移動
        {
          agent.bot.chat(`移動しています...`);
          await Promise.all(
            bots.map((bot) => bot.movePath(bot.path ? bot.path : []))
          ).catch(() => {
            agent.bot.chat(`移動エラー`);
          });
          agent.bot.chat(`完了しました`);
        }

        break;

      case "logout":
        // ログアウト
        {
          bots
            .filter((bot) => bot.id !== 0)
            .forEach((bot) => {
              bot.stop();
            });
          bots = [];
          agent.bot.chat(`ログアウトしました`);
        }

        break;

      case "come":
        // 現在の位置まで移動
        {
          //agent.bot.navigate.to(target.position);
          await agent.moveTo(target.position).catch(() => {
            agent.bot.chat("移動エラー");
          });
          agent.bot.chat(`移動しました`);
        }
        break;

      case "stop":
        {
          agent.bot.pathfinder.stop();
        }
        break;
    }
  });
}
