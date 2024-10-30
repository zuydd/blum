import axios from "axios";
import colors from "colors";

class Server {
  constructor() {}

  async getData(lang) {
    try {
      const endpointDatabase =
        "https://raw.githubusercontent.com/zuydd/database/main/blum.json";
      const { data } = await axios.get(endpointDatabase);
      return data;
    } catch (error) {
      console.log(colors.red(lang?.server?.get_json_github_error));
      return null;
    }
  }

  async showNoti(lang) {
    const database = await this.getData();
    if (database && database.noti) {
      console.log(colors.blue("📢 " + lang?.server?.noti));
      console.log(database.noti);
      console.log("");
    }
  }

  async checkVersion(curentVersion, lang, database = null) {
    if (!database) {
      database = await this.getData(lang);
    }

    if (database && curentVersion !== database.ver) {
      console.log(
        colors.yellow(
          `🚀 ${lang?.server?.noti_new_version} ${colors.blue(database.ver)}, ${
            lang?.server?.download_now
          } 👉 ${colors.blue("https://github.com/zuydd/blum")}`
        )
      );
      console.log("");
    }
  }
}

const server = new Server();
export default server;
