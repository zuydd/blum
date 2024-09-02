import colors from "colors";
import dayjs from "dayjs";

class FarmingClass {
  constructor() {}

  async startFarming(user) {
    try {
      const { data } = await user.http.post(0, "farming/start", {});
      if (data) {
        user.log.log(
          `Đã bắt đầu farming, chờ claim sau: ${colors.blue("480 phút")}`
        );
        return true;
      } else {
        throw new Error(`Bắt đầu farming thất bại: ${data.message}`);
      }
    } catch (error) {
      user.log.logError(
        `Bắt đầu farming thất bại: ${error.response?.data?.message}`
      );
      return false;
    }
  }

  async claimFarming(user, balance) {
    try {
      const { data } = await user.http.post(0, "farming/claim", {});
      if (data) {
        user.log.log(
          `Claim farming thành công, phần thưởng: ${colors.green(
            balance + user.currency
          )}`
        );
        return true;
      } else {
        throw new Error(`Claim farming thất bại: ${data.message}`);
      }
    } catch (error) {
      user.log.logError(
        `Claim farming thất bại: ${error.response?.data?.message}`
      );
      return false;
    }
  }

  async handleFarming(user, infoFarming) {
    if (!infoFarming) {
      await this.startFarming(user);
      return 480;
    } else {
      const diffTimeClaim = dayjs().diff(dayjs(infoFarming?.endTime), "minute");

      if (diffTimeClaim > 0) {
        const statusClaim = await this.claimFarming(user, infoFarming?.balance);
        if (statusClaim) {
          await this.startFarming(user);
          return 480;
        } else {
          return 5;
        }
      } else {
        user.log.log(
          `Chưa tới thời gian claim, chờ sau: ${colors.blue(
            Math.abs(diffTimeClaim) + " phút"
          )}`
        );
        return Math.abs(diffTimeClaim);
      }
    }
  }
}

const farmingClass = new FarmingClass();
export default farmingClass;
