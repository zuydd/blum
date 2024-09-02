import colors from "colors";
import delayHelper from "../helpers/delay.js";
import generatorHelper from "../helpers/generator.js";

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
    const points = generatorHelper.randomInt(1800, 2200);
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

  async handleGame(user, playPasses) {
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
  }
}

const gameService = new GameService();
export default gameService;
