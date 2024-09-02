import colors from "colors";

class DailyService {
  constructor() {}

  async checkin(user) {
    try {
      const { data } = await user.http.post(0, "daily-reward?offset=-420");
      if (data) {
        user.log.log("Checkin thành công, phần thưởng: ");
        return data;
      } else {
        throw new Error(`Checkin thất bại: ${data.message}`);
      }
    } catch (error) {
      if (
        error.status === 400 &&
        error.response?.data?.message === "same day"
      ) {
        user.log.log(colors.magenta("Đã checkin hôm nay"));
      } else {
        user.log.logError(`Checkin thất bại: ${error.response?.data?.message}`);
      }
      return null;
    }
  }
}

const dailyService = new DailyService();
export default dailyService;
