import colors from "colors";
import fileHelper from "../helpers/file.js";
import tokenHelper from "../helpers/token.js";

class AuthService {
  constructor() {}

  async login(user, lang, skipLog = false) {
    user.http.updateToken(null);
    user.http.updateRefreshToken(null);
    const body = {
      query: user.query_id,
      referralToken: user?.database?.ref,
    };
    try {
      const { data } = await user.http.post(
        3,
        "auth/provider/PROVIDER_TELEGRAM_MINI_APP",
        body
      );
      if (data?.token) {
        return {
          access: data?.token?.access,
          refresh: data?.token?.refresh,
        };
      }
      return null;
    } catch (error) {
      if (!skipLog) {
        user.log.logError(
          `${lang?.auth?.login_error}: ${error.response?.data?.message}`
        );
      }
      return null;
    }
  }

  async refresh(user, lang, refreshToken, skipLog = false) {
    user.http.updateToken(null);
    user.http.updateRefreshToken(null);
    const body = {
      refresh: refreshToken,
    };
    try {
      const { data } = await user.http.post(1, "auth/refresh", body);
      if (data?.access) {
        return {
          access: data.access,
          refresh: data.refresh,
        };
      }
      return null;
    } catch (error) {
      if (!skipLog) {
        user.log.logError(
          `${lang?.auth?.refresh_token_error_msg}: ${error.response?.data?.message}`
        );
      }
      return null;
    }
  }

  async handleLogin(user, lang) {
    console.log(
      `============== ${lang?.auth?.run_account} ${user.index} | ${user.info.fullName.green} ==============`
    );

    let info = null;
    let token = fileHelper.getTokenById(user.info.id);

    if (token && !tokenHelper.isExpired(token.access)) {
      const info = {
        access: token.access,
        refresh: token.refresh,
      };
      const profile = await this.handleAfterLogin(user, lang, info);
      return {
        status: 1,
        profile,
      };
    }

    let infoLogin = await this.login(user, lang);

    if (infoLogin) {
      const profile = await this.handleAfterLogin(user, lang, infoLogin);
      return {
        status: 1,
        profile,
      };
    }
    user.log.logError(lang?.auth?.login_error_msg);
    return {
      status: 0,
      profile: null,
    };
  }

  async getProfile(user, lang) {
    try {
      const { data } = await user.http.get(0, "user/balance");
      if (data) {
        return data;
      }
      return null;
    } catch (error) {
      user.log.logError(
        `${lang?.auth?.get_info_error_msg}: ${error.response?.data?.message}`
      );
      return null;
    }
  }

  async reconnect(user, lang) {
    let info = null;
    let token = fileHelper.getTokenById(user.info.id);

    if (
      token &&
      tokenHelper.isExpired(token.access) &&
      !tokenHelper.isExpired(token.refresh)
    ) {
      info = await this.refresh(user, lang, token.refresh, true);
      if (info) {
        await this.handleAfterReconnect(user, info);
        return 1;
      }
    }

    let infoLogin = await this.login(user, lang, true);

    if (infoLogin) {
      await this.handleAfterReconnect(user, infoLogin);
      return 1;
    }
    // user.log.logError(
    //   "Quá trình kết nối lại thất bại, vui lòng kiểm tra lại thông tin tài khoản (có thể cần phải lấy mới query_id)"
    // );
    return 0;
  }

  async handleAfterLogin(user, lang, info) {
    const accessToken = info.access || null;
    const refreshToken = info.refresh || null;
    user.http.updateToken(accessToken);
    user.http.updateRefreshToken(refreshToken);
    fileHelper.saveToken(user.info.id, info);
    const profile = await this.getProfile(user, lang);
    if (profile) {
      user.log.log(
        colors.green(lang?.auth?.login_success) +
          `${lang?.auth?.points} ${
            colors.green(Math.round(profile?.availableBalance)) + user.currency
          }`
      );
      if (!user.http.isConnected) {
        user.http.updateConnect(true);
        setInterval(async () => {
          await this.reconnect(user, lang);
        }, 60 * 1000 * 20);
      }
    }
    return profile;
  }

  async handleAfterReconnect(user, info) {
    const accessToken = info.access || null;
    const refreshToken = info.refresh || null;
    user.http.updateToken(accessToken);
    user.http.updateRefreshToken(refreshToken);
    fileHelper.saveToken(user.info.id, info);
    // const profile = await this.getProfile(user);
    // if (profile) {
    //   user.log.logSuccess("Kết nối lại thành công");
    // }
  }
}

const authService = new AuthService();
export default authService;
