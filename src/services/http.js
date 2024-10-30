import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

export class HttpService {
  constructor(log, device, proxy = null) {
    this.baseURL = [
      "https://game-domain.blum.codes/api/v1/",
      "https://gateway.blum.codes/v1/",
      "https://tribe-domain.blum.codes/api/v1/",
      "https://user-domain.blum.codes/api/v1/",
      "https://earn-domain.blum.codes/api/v1/",
      "https://game-domain.blum.codes/api/v2/",
    ];
    this.proxy = proxy;
    this.log = log;
    this.token = null;
    this.refreshToken = null;
    this.isConnected = false;
    this.device = device;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      "Sec-Fetch-Site": "same-site",
      "Accept-Language": "vi-VN,vi;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Sec-Fetch-Mode": "cors",
      // Host: "tgapp-api.matchain.io",
      Origin: "https://telegram.blum.codes",
      "User-Agent": this.device.userAgent,
      Referer: "https://telegram.blum.codes/",
      Connection: "keep-alive",
      "Sec-Fetch-Dest": "empty",
    };
  }

  updateToken(token) {
    this.token = token;
  }

  updateRefreshToken(token) {
    this.refreshToken = token;
  }

  updateConnect(status) {
    this.isConnected = status;
  }

  initConfig() {
    const headers = {
      ...this.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    const config = {
      headers,
    };
    if (this.proxy && this.proxy !== "skip") {
      config["httpsAgent"] = new HttpsProxyAgent(this.proxy);
    }
    return config;
  }

  get(domain, endPoint) {
    const url = this.baseURL[domain] + endPoint;
    const config = this.initConfig();
    return axios.get(url, config);
  }

  post(domain, endPoint, body) {
    const url = this.baseURL[domain] + endPoint;
    const config = this.initConfig();
    return axios.post(url, body, config);
  }

  put(domain, endPoint, body) {
    const url = this.baseURL[domain] + endPoint;
    const config = this.initConfig();
    return axios.put(url, body, config);
  }

  async checkProxyIP(lang) {
    if (!this.proxy || this.proxy === "skip") {
      this.log.updateIp("🖥️");
      return null;
    }
    try {
      const proxyAgent = new HttpsProxyAgent(this.proxy);
      const response = await axios.get("https://api.ipify.org?format=json", {
        httpsAgent: proxyAgent,
      });
      if (response.status === 200) {
        const ip = response.data.ip;
        this.log.updateIp(ip);
        return ip;
      } else {
        throw new Error(lang?.http?.error_proxy);
      }
    } catch (error) {
      this.log.updateIp("🖥️");
      return -1;
    }
  }
}
