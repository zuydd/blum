import colors from "colors";

class InviteClass {
  constructor() {}

  async getBalanceInvite(user, lang) {
    try {
      const { data } = await user.http.get(3, "friends/balance");
      if (data) {
        return data;
      } else {
        throw new Error(`${lang?.invite?.get_info_failed}: ${data.message}`);
      }
    } catch (error) {
      user.log.logError(
        `${lang?.invite?.get_info_failed}: ${error.response?.data?.message}`
      );
      return 0;
    }
  }

  async claimInvite(user, lang) {
    try {
      const { data } = await user.http.post(3, "friends/claim", {});
      if (data) {
        user.log.log(
          `${lang?.invite?.claim_success}: ${colors.green(
            data?.claimBalance + user.currency
          )}`
        );
        return true;
      } else {
        throw new Error(`${lang?.invite?.claim_failed}: ${data.message}`);
      }
    } catch (error) {
      user.log.logError(
        `${lang?.invite?.claim_failed}: ${error.response?.data?.message}`
      );
      return false;
    }
  }

  async handleInvite(user, lang) {
    const balance = await this.getBalanceInvite(user, lang);
    if (balance.amountForClaim > 0 && balance.canClaim) {
      await this.claimInvite(user, lang);
    }
  }
}

const inviteClass = new InviteClass();
export default inviteClass;
