import colors from "colors";

class DailyService {
  constructor() {}

  async getDataCheckin(user, lang) {
    try {
      const { data } = await user.http.get(6, "daily-reward");

      if (data && data?.claim === "available") {
        return 2;
      } else if (data && data?.claim === "unavailable") {
        return 1;
      } else {
        throw new Error(data?.message);
      }
    } catch (error) {
      user.log.logError(`${lang?.daily?.checkin_failed}: ${error}`);
      return -1;
    }
  }

  async checkin(user, lang) {
    try {
      const { data } = await user.http.post(6, "daily-reward");

      if (data && data?.claimed) {
        user.log.log(
          `${lang?.daily?.checkin_success}: ${colors.green(
            data?.claimedReward?.passes
          )} ${lang?.daily?.game_turn} - ${colors.green(
            data?.claimedReward?.points + user.currency
          )}`
        );
        return 1;
      } else {
        throw new Error(data?.message);
      }
    } catch (error) {
      user.log.logError(`${lang?.daily?.checkin_failed}: ${error}`);
      return -1;
    }
  }

  async handleCheckin(user, lang) {
    const dataCheckin = await this.getDataCheckin(user, lang);
    if (dataCheckin === 1) {
      user.log.log(colors.magenta(lang?.daily?.checked));
    } else if (dataCheckin === 2) {
      const statusCheckin = await this.checkin(user, lang);
    }
  }
}

const dailyService = new DailyService();
export default dailyService;
