import colors from "colors";

class TribeService {
  constructor() {}

  async getInfo(user) {
    try {
      const { data } = await user.http.get(2, "tribe/my");
      if (data) {
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      if (error.response?.data?.message === "NOT_FOUND") {
        return false;
      } else {
        // user.log.logError(
        //   `Lấy thông tin tribe thất bại: ${error.response?.data?.message}`
        // );
        return null;
      }
    }
  }

  async joinTribe(user, tribeId = "642e3141-5536-4d2f-9a5f-a62a35ede62c") {
    const endpoint = `tribe/${tribeId}/join`;
    try {
      const { data } = await user.http.post(2, endpoint, {});
      if (data) {
        user.log.log(
          "Tham gia thành công Tribe: " + colors.rainbow("Thỏ Bảy Màu") + " 🌈"
        );
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      user.log.logError(
        `Tham gia tribe thất bại: ${error.response?.data?.message}`
      );
    }
  }

  async handleTribe(user) {
    const infoTribe = await this.getInfo(user);
    if (infoTribe === null) return;
    if (!infoTribe) {
      await this.joinTribe(user);
    }
  }
}

const tribeService = new TribeService();
export default tribeService;
