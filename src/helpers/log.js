import colors from "colors";

export class LogHelper {
  constructor(index, userId) {
    this.index = index;
    this.userId = userId;
    this.ip = "🖥️";
  }

  log(msg) {
    console.log(
      `[ No ${this.index} _ ID: ${this.userId} _ IP: ${this.ip} ] ${msg}`
    );
  }

  logError(msg) {
    console.log(
      `[ No ${this.index} _ ID: ${this.userId} _ IP: ${this.ip} ] ${colors.red(
        msg
      )}`
    );
  }

  logSuccess(msg) {
    console.log(
      `[ No ${this.index} _ ID: ${this.userId} _ IP: ${
        this.ip
      } ] ${colors.green(msg)}`
    );
  }

  updateIp(ip) {
    this.ip = ip;
  }
}

const logHelper = new LogHelper();
export default logHelper;
