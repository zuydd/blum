import colors from "colors";

class DailyService {
  constructor() {}

  async getDataCheckin(user) {
    try {
      const { data } = await user.http.get(0, "daily-reward?offset=-420");
      if (data) {
        return data?.days[2];
      }
    } catch (error) {
      if (error.status === 404 && error.response.data.message === "Not Found") {
        return 1;
      }
      return -1;
    }
  }

  async checkin(user, lang) {
    const dataCheckin = await this.getDataCheckin(user);
    if (dataCheckin === 1) {
      user.log.log(colors.magenta(lang?.daily?.checked));
    } else if (dataCheckin?.reward) {
      try {
        const { data } = await user.http.post(0, "daily-reward?offset=-420");
        if (data) {
          user.log.log(
            `${lang?.daily?.checkin_success}: ${colors.green(
              dataCheckin.reward.passes
            )} ${lang?.daily?.game_turn} - ${colors.green(
              dataCheckin.reward.points + user.currency
            )}`
          );
        } else {
          throw new Error(`${lang?.daily?.checkin_failed}: ${data.message}`);
        }
      } catch (error) {
        user.log.logError(
          `${lang?.daily?.checkin_failed}: ${error.response?.data?.message}`
        );
        return null;
      }
    }
  }
}

const dailyService = new DailyService();
export default dailyService;
