import colors from "colors";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import delayHelper from "../helpers/delay.js";
import generatorHelper from "../helpers/generator.js";
import { pack, proof } from "../helpers/payload-blum.js";
import authService from "./auth.js";
dayjs.extend(utc);
dayjs.extend(timezone);

class GameService {
  constructor() {
    this.API_KEY = "";
    this.REMAINING_QUOTA = 99999;
  }

  setApiKey(apiKey) {
    this.API_KEY = apiKey;
  }

  setQuota(quota) {
    this.REMAINING_QUOTA = quota;
  }

  async playGame(user, lang, delay) {
    try {
      const { data } = await user.http.post(5, "game/play", {});
      if (data.message === "another game in progress") {
        return 3;
      }

      if (data) {
        user.log.log(
          `${lang?.game?.start_game_msg}: ${colors.blue(delay + "s")}`
        );
        return data.gameId;
      } else {
        throw new Error(`${lang?.game?.start_game_failed}: ${data.message}`);
      }
    } catch (error) {
      if (error.response?.data?.message === "not enough play passes") {
        return 2;
      } else {
        user.log.logError(
          `${lang?.game?.start_game_failed}: ${error.response?.data?.message}`
        );
      }
      return null;
    }
  }

  async claimGame(user, lang, gameId) {
    const randomPoints = user?.database?.randomPoints || [150, 190];
    const multiplierPoint = user?.database?.multiplierPoint || 1;
    let points = generatorHelper.randomInt(randomPoints[0], randomPoints[1]);
    const payload = await this.createPlayload(user, lang, gameId, points);
    if (!payload) return;

    const body = { payload };
    try {
      const { text, data } = await user.http.post(5, "game/claim", body);

      if (data === "OK") {
        user.log.log(
          `${lang?.game?.claim_success}: ${colors.green(
            points * multiplierPoint + user.currency
          )}`
        );
        return true;
      } else {
        throw new Error(`${lang?.game?.claim_failed}: ${data?.message}`);
      }
    } catch (error) {
      user.log.logError(
        `${lang?.game?.claim_failed}: ${error.response?.data?.message}`
      );
      return false;
    }
  }

  async createPlayload(user, lang, gameId, points) {
    const resultProof = await proof(gameId);
    const MULTIPLIER_POINT = user?.database?.multiplierPoint || 1;

    const challenge = {
      id: generatorHelper.uuid(),
      ...resultProof,
    };

    const earnedAssets = {
      CLOVER: {
        clicks: parseInt(points),
      },
      FREEZE: {
        clicks: generatorHelper.randomInt(0, 2),
      },
      BOMB: {
        clicks: 0,
      },
    };

    const totalPoints = {
      BP: {
        amount: parseInt(points) * MULTIPLIER_POINT,
      },
    };

    const resultPack = await pack(gameId, challenge, totalPoints, earnedAssets);

    const payload = resultPack;
    return payload;
  }

  checkTimePlayGame(time) {
    // Lấy giờ hiện tại theo múi giờ Việt Nam (UTC+7)
    const nowHour = dayjs().hour();
    return !time.includes(nowHour);
  }

  getMinutesUntilNextStart(times) {
    // Lấy giờ hiện tại theo múi giờ Việt Nam (UTC+7)
    const currentHour = dayjs().hour();
    times.sort((a, b) => a - b);

    let nextHour = currentHour + 1;

    while (times.includes(nextHour)) {
      nextHour++;
    }

    const now = dayjs();

    const nextStartTime = now
      .set("hour", nextHour)
      .set("minute", 0)
      .set("second", 0);

    // Tính số phút từ giờ hiện tại đến lần bắt đầu tiếp theo
    return nextStartTime.diff(now, "minute");
  }

  async handleGame(user, lang, playPasses, timePlayGame) {
    const isInTimeRange = this.checkTimePlayGame(timePlayGame);
    if (isInTimeRange) {
      const profile = await authService.getProfile(user, lang);
      if (profile) playPasses = profile?.playPasses;
      const msg = lang?.game?.game_remaining.replace(
        "XXX",
        colors.blue(playPasses)
      );
      user.log.log(`${msg}`);
      let gameCount = playPasses || 0;
      let errorCount = 0;
      while (gameCount > 0) {
        if (errorCount > 3) {
          gameCount = 0;
          continue;
        }
        // if (!this.API_KEY) {
        //   user.log.log(colors.yellow(lang?.game?.no_api_key));
        //   gameCount = 0;
        //   continue;
        // }
        if (this.REMAINING_QUOTA <= 0) {
          user.log.log(colors.yellow(lang?.game?.key_limit_used));
          gameCount = 0;
          continue;
        }
        await delayHelper.delay(2);
        const delay = 30 + generatorHelper.randomInt(5, 10);
        const gameId = await this.playGame(user, lang, delay);
        if (gameId === 2) {
          gameCount = 0;
          continue;
        }
        if (gameId === 3) {
          user.log.log(
            colors.yellow(
              "Đang trong một lượt chơi khác vui lòng chờ và thử lại"
            )
          );
          await delayHelper.delay(180);
          continue;
        }
        if (gameId) {
          errorCount = 0;

          await delayHelper.delay(delay);
          const statusClaim = await this.claimGame(user, lang, gameId);
          if (!statusClaim) {
            errorCount++;
          }
          if (statusClaim) gameCount--;
        } else {
          errorCount++;
        }
      }
      if (playPasses > 0) user.log.log(colors.magenta(lang?.game?.used_turns));
      return -1;
    } else {
      const minutesUntilNextStart = this.getMinutesUntilNextStart(timePlayGame);
      user.log.log(
        colors.yellow(
          `${lang?.game?.skip_play_game_msg}: ${colors.blue(
            minutesUntilNextStart + ` ${lang?.game?.minute}`
          )}`
        )
      );
      return minutesUntilNextStart;
    }
  }
}

const gameService = new GameService();
export default gameService;
