import axios from "axios";
import colors from "colors";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import delayHelper from "../helpers/delay.js";
import generatorHelper from "../helpers/generator.js";
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

  async claimGame(user, lang, gameId, eligibleDogs) {
    let points = generatorHelper.randomInt(180, 200);
    let dogs = 0;
    if (eligibleDogs) {
      points = generatorHelper.randomInt(90, 110);
      dogs = generatorHelper.randomInt(5, 10) * 0.1;
    }
    const payload = await this.createPlayload(user, lang, gameId, points, dogs);

    if (!payload) return;

    const body = { payload };
    try {
      const { data } = await user.http.post(5, "game/claim", body);
      if (data) {
        user.log.log(
          `${lang?.game?.claim_success}: ${colors.green(
            points + user.currency
          )}${eligibleDogs ? ` - ${dogs} 🦴` : ""}`
        );
        return true;
      } else {
        throw new Error(`${lang?.game?.claim_failed}: ${data.message}`);
      }
    } catch (error) {
      user.log.logError(
        `${lang?.game?.claim_failed}: ${error.response?.data?.message}`
      );
      return false;
    }
  }

  async createPlayload(user, lang, gameId, points, dogs) {
    let server = "";
    if (!this.API_KEY) {
      const servers =
        user?.database?.payloadServer?.filter(
          (server) => server.status === 1
        ) || [];
      if (servers.length) {
        const index = generatorHelper.randomInt(0, servers.length - 1);
        server = `https://${servers[index].id}.vercel.app/api/`;
      } else {
        console.log(colors.yellow(lang?.game?.not_found_server_free));
        return null;
      }
    } else {
      const isPro = this.API_KEY.includes("pro");
      if (isPro) {
        const servers =
          user?.database?.server?.pro?.filter(
            (server) => server.status === 1
          ) || [];

        if (servers.length) {
          const randomServer = generatorHelper.randomInt(0, servers.length - 1);
          server = servers[randomServer].url;
        } else {
          return null;
        }
      } else {
        const servers =
          user?.database?.server?.free?.filter(
            (server) => server.status === 1
          ) || [];

        if (servers.length) {
          const randomServer = generatorHelper.randomInt(0, servers.length - 1);
          server = servers[randomServer].url;
        } else {
          console.log(colors.yellow(lang?.game?.not_found_server_free));
          return null;
        }
      }
    }

    try {
      let endpointPayload = `${server}blum/payload`;
      if (!this.API_KEY) {
        endpointPayload = `${server}blum`;
      }
      const { data } = await axios.post(
        endpointPayload,
        {
          game_id: gameId,
          points,
          dogs,
        },
        {
          headers: {
            "X-API-KEY": this.API_KEY,
          },
        }
      );
      let payload = data.payload;
      let remaining_quota = 999999;
      if (this.API_KEY) {
        payload = data.data.payload;
        remaining_quota = data.data.remaining_quota;
        this.setQuota(remaining_quota);
      }

      if (payload) {
        return payload;
      }
      throw new Error(`${lang?.game?.create_payload_failed}: ${data?.error}`);
    } catch (error) {
      console.log(colors.red(error?.response?.data?.message));
      return null;
    }
  }

  async eligibilityDogs(user) {
    try {
      const { data } = await user.http.get(5, "game/eligibility/dogs_drop");
      return data.eligible;
    } catch (error) {
      return false;
    }
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
      const eligibleDogs = await this.eligibilityDogs(user);
      const textDropDogs =
        (eligibleDogs ? lang?.game?.can : lang?.game?.notcan) +
        ` ${lang?.game?.claim_dogs} 🦴`;
      const msg = lang?.game?.game_remaining.replace(
        "XXX",
        colors.blue(playPasses)
      );
      user.log.log(`${msg} ${colors.magenta(`[${textDropDogs}]`)}`);
      let gameCount = playPasses || 0;
      let errorCount = 0;
      while (gameCount > 0) {
        if (errorCount > 20) {
          gameCount = 0;
          continue;
        }
        if (!this.API_KEY) {
          user.log.log(colors.yellow(lang?.game?.no_api_key));
          gameCount = 0;
          continue;
        }
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
        if (gameId) {
          errorCount = 0;

          await delayHelper.delay(delay);
          const statusClaim = await this.claimGame(
            user,
            lang,
            gameId,
            eligibleDogs
          );
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
