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

  async checkin(user) {
    const dataCheckin = await this.getDataCheckin(user);
    if (dataCheckin === 1) {
      user.log.log(colors.magenta("Đã checkin hôm nay"));
    } else if (dataCheckin?.reward) {
      try {
        const { data } = await user.http.post(0, "daily-reward?offset=-420");
        if (data) {
          user.log.log(
            `Checkin thành công, phần thưởng: ${colors.green(
              dataCheckin.reward.passes + " lượt"
            )} chơi game - ${colors.green(
              dataCheckin.reward.points + user.currency
            )}`
          );
        } else {
          throw new Error(`Checkin thất bại: ${data.message}`);
        }
      } catch (error) {
        user.log.logError(`Checkin thất bại: ${error.response?.data?.message}`);
        return null;
      }
    }
  }
}

const dailyService = new DailyService();
export default dailyService;
