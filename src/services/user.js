import colors from "colors";
import he from "he";
import { parse } from "querystring";
import fileHelper from "../helpers/file.js";
import { LogHelper } from "../helpers/log.js";
import { HttpService } from "./http.js";
import server from "./server.js";

class UserService {
  constructor() {}

  async loadUser() {
    const rawUsers = fileHelper.readFile("users.txt");
    const rawProxies = fileHelper.readFile("proxy.txt");

    const users = rawUsers
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const proxies = rawProxies
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (users.length <= 0) {
      console.log(colors.red(`Không tìm thấy dữ liệu user`));
      return [];
    } else {
      let database = {};
      database = await server.getData();
      database.ref = database?.ref || "9m5hchoOPE";

      const result = users.map((user, index) => {
        const userParse = parse(he.decode(decodeURIComponent(user)));
        const info = JSON.parse(userParse.user);
        const proxy = proxies[index] || null;
        const log = new LogHelper(index + 1, info.id);
        const http = new HttpService(log, proxy);
        let query_id = user;
        if (user && user.includes("query_id%3D")) {
          query_id = he.decode(decodeURIComponent(query_id));
        }
        return {
          query_id,
          index: index + 1,
          info: {
            ...info,
            fullName: (info.first_name + " " + info.last_name).trim(),
            auth_date: userParse.auth_date,
            hash: userParse.hash,
          },
          database,
          proxy,
          http,
          log,
          currency: colors.green.bold(" ₿"),
        };
      });
      return result;
    }
  }
}

const userService = new UserService();
export default userService;
