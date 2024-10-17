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
  constructor() {}

  async playGame(user, delay) {
    try {
      const { data } = await user.http.post(5, "game/play", {});

      if (data) {
        user.log.log(
          `Bắt đầu chơi game, kết thúc và nhận thưởng sau: ${colors.blue(
            delay + "s"
          )}`
        );
        return data.gameId;
      } else {
        throw new Error(`Chơi game thất bại: ${data.message}`);
      }
    } catch (error) {
      if (error.response?.data?.message === "not enough play passes") {
        return 2;
      } else {
        user.log.logError(
          `Chơi game thất bại: ${error.response?.data?.message}`
        );
      }
      return null;
    }
  }

  async claimGame(user, gameId, eligibleDogs) {
    let points = generatorHelper.randomInt(180, 200);
    let dogs = 0;
    if (eligibleDogs) {
      points = generatorHelper.randomInt(90, 110);
      dogs = generatorHelper.randomInt(15, 20) * 5;
    }
    const payload = await this.createPlayload(user, gameId, points, dogs);

    if (!payload) return;

    const body = { payload };
    try {
      const { data } = await user.http.post(5, "game/claim", body);
      if (data) {
        user.log.log(
          `Chơi game xong, phần thưởng: ${colors.green(
            points + user.currency
          )}${eligibleDogs ? ` - ${dogs} 🦴` : ""}`
        );
        return true;
      } else {
        throw new Error(`Nhận thưởng chơi game thất bại: ${data.message}`);
      }
    } catch (error) {
      user.log.logError(
        `Nhận thưởng chơi game thất bại: ${error.response?.data?.message}`
      );
      return false;
    }
  }

  async createPlayload(user, gameId, points, dogs) {
    const servers =
      user?.database?.payloadServer?.filter((server) => server.status === 1) ||
      [];
    let server = "zuydd";
    if (servers.length) {
      const index = generatorHelper.randomInt(0, servers.length - 1);
      server = servers[index];
    }
    try {
      const endpointPayload = `https://${server.id}.vercel.app/api/blum`;
      const { data } = await axios.post(endpointPayload, {
        game_id: gameId,
        points,
        dogs,
      });

      if (data.payload) return data.payload;
      throw new Error(`Tạo payload thất bại: ${data?.error}`);
    } catch (error) {
      console.log(colors.red(error.response.data.error));
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

  async handleGame(user, playPasses, timePlayGame) {
    const isInTimeRange = this.checkTimePlayGame(timePlayGame);
    if (isInTimeRange) {
      const profile = await authService.getProfile(user);
      if (profile) playPasses = profile?.playPasses;
      const eligibleDogs = await this.eligibilityDogs(user);
      const textDropDogs =
        (eligibleDogs ? "có thể" : "không thể") + " nhặt DOGS 🦴";
      user.log.log(
        `Còn ${colors.blue(playPasses + " lượt")} chơi game ${colors.magenta(
          `[${textDropDogs}]`
        )}`
      );
      let gameCount = playPasses || 0;
      let errorCount = 0;
      while (gameCount > 0) {
        if (errorCount > 20) {
          gameCount = 0;
          continue;
        }
        await delayHelper.delay(2);
        const delay = 30 + generatorHelper.randomInt(5, 10);
        const gameId = await this.playGame(user, delay);
        if (gameId === 2) {
          gameCount = 0;
          continue;
        }
        if (gameId) {
          errorCount = 0;

          await delayHelper.delay(delay);
          const statusClaim = await this.claimGame(user, gameId, eligibleDogs);
          if (statusClaim) gameCount--;
        } else {
          errorCount++;
        }
      }
      if (playPasses > 0)
        user.log.log(colors.magenta("Đã dùng hết lượt chơi game"));
      return -1;
    } else {
      const minutesUntilNextStart = this.getMinutesUntilNextStart(timePlayGame);
      user.log.log(
        colors.yellow(
          `Đã cài đặt không thể chơi game trong khoảng thời gian này, lần chơi tiếp theo sau: ${colors.blue(
            minutesUntilNextStart + " phút"
          )}`
        )
      );
      return minutesUntilNextStart;
    }
  }
}

const gameService = new GameService();
export default gameService;
