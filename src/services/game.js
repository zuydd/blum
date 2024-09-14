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

  async playGame(user) {
    try {
      const { data } = await user.http.post(0, "game/play", {});
      if (data) {
        user.log.log(
          `Bắt đầu chơi game, kết thúc và nhận thưởng sau: ${colors.blue(
            "30s"
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

  async claimGame(user, gameId) {
    const points = generatorHelper.randomInt(180, 200);
    const body = { gameId, points };
    try {
      const { data } = await user.http.post(0, "game/claim", body);
      if (data) {
        user.log.log(
          `Chơi game xong, phần thưởng: ${colors.green(points + user.currency)}`
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

  checkTimePlayGame(time) {
    // Lấy giờ hiện tại theo múi giờ Việt Nam (UTC+7)
    const now = dayjs().tz("Asia/Ho_Chi_Minh");

    // Tạo đối tượng dayjs cho giờ bắt đầu và kết thúc theo ngày hiện tại
    const startTime = dayjs()
      .tz("Asia/Ho_Chi_Minh")
      .hour(time[0])
      .minute(0)
      .second(0);
    const endTime = dayjs()
      .tz("Asia/Ho_Chi_Minh")
      .hour(time[1])
      .minute(0)
      .second(0);

    // Kiểm tra nếu giờ kết thúc là sau nửa đêm, cần điều chỉnh sang ngày hôm sau
    if (endTime.isBefore(startTime)) {
      endTime.add(1, "day");
    }

    // Kiểm tra xem giờ hiện tại có nằm trong khoảng giờ không
    return now.isAfter(startTime) && now.isBefore(endTime);
  }

  getMinutesUntilNextStart(time) {
    // Lấy giờ hiện tại theo múi giờ Việt Nam (UTC+7)
    const now = dayjs().tz("Asia/Ho_Chi_Minh");

    // Tạo đối tượng dayjs cho giờ bắt đầu (17h hôm nay)
    let nextStartTime = dayjs()
      .tz("Asia/Ho_Chi_Minh")
      .hour(time[0])
      .minute(0)
      .second(0);

    // Kiểm tra nếu giờ hiện tại đã qua giờ bắt đầu (17h), chuyển giờ bắt đầu sang ngày hôm sau
    if (now.isAfter(nextStartTime)) {
      nextStartTime = nextStartTime.add(1, "day");
    }

    // Tính số phút từ giờ hiện tại đến lần bắt đầu tiếp theo
    return nextStartTime.diff(now, "minute");
  }

  async handleGame(user, playPasses, timePlayGame) {
    const isInTimeRange = this.checkTimePlayGame(timePlayGame);
    if (isInTimeRange) {
      const profile = await authService.getProfile(user);
      if (profile) playPasses = profile?.playPasses;
      user.log.log(`Còn ${colors.blue(playPasses + " lượt")} chơi game`);
      let gameCount = playPasses || 0;
      let errorCount = 0;
      while (gameCount > 0) {
        if (errorCount > 20) {
          gameCount = 0;
          continue;
        }
        await delayHelper.delay(2);
        const gameId = await this.playGame(user);
        if (gameId === 2) {
          gameCount = 0;
          continue;
        }
        if (gameId) {
          errorCount = 0;
          await delayHelper.delay(32);
          const statusClaim = await this.claimGame(user, gameId);
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
          `Không thể chơi game ngoài khoảng thời gian từ ${timePlayGame[0]}-${
            timePlayGame[1]
          } giờ, lần chơi tiếp theo sau: ${colors.blue(
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
