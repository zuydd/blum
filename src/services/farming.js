import colors from "colors";
import dayjs from "dayjs";

class FarmingClass {
  constructor() {}

  async startFarming(user, lang) {
    try {
      const { data } = await user.http.post(0, "farming/start", {});
      if (data) {
        user.log.log(
          `${lang?.farming?.start_farming_msg}: ${colors.blue(
            lang?.farming?.time_farming
          )}`
        );
        return true;
      } else {
        throw new Error(
          `${lang?.farming?.start_farming_failed}: ${data.message}`
        );
      }
    } catch (error) {
      user.log.logError(
        `${lang?.farming?.start_farming_failed}: ${error.response?.data?.message}`
      );
      return false;
    }
  }

  async claimFarming(user, lang, balance) {
    try {
      const { data } = await user.http.post(0, "farming/claim", {});
      if (data) {
        user.log.log(
          `${lang?.farming?.claim_farming_success}: ${colors.green(
            balance + user.currency
          )}`
        );
        return true;
      } else {
        throw new Error(
          `${lang?.farming?.claim_farming_failed}: ${data.message}`
        );
      }
    } catch (error) {
      user.log.logError(
        `${lang?.farming?.claim_farming_failed}: ${error.response?.data?.message}`
      );
      return false;
    }
  }

  async handleFarming(user, lang, infoFarming) {
    if (!infoFarming) {
      await this.startFarming(user, lang);
      return 480;
    } else {
      const diffTimeClaim = dayjs().diff(dayjs(infoFarming?.endTime), "minute");

      if (diffTimeClaim > 0) {
        const statusClaim = await this.claimFarming(
          user,
          lang,
          infoFarming?.balance
        );
        if (statusClaim) {
          await this.startFarming(user, lang);
          return 480;
        } else {
          return 5;
        }
      } else {
        user.log.log(
          `${lang?.farming?.countdown_farming_msg}: ${colors.blue(
            Math.abs(diffTimeClaim) + " " + lang?.farming?.minute
          )}`
        );
        return Math.abs(diffTimeClaim);
      }
    }
  }
}

const farmingClass = new FarmingClass();
export default farmingClass;
