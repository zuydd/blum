import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

class FileHelper {
  constructor() {}

  readFile(fileName) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filePath = path.join(__dirname, "..", "data", fileName);

    const datas = fs.readFileSync(filePath, "utf8");
    return datas;
  }

  writeFile(fileName, data) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filePath = path.join(__dirname, "..", "data", fileName);

    fs.writeFileSync(filePath, data);
  }

  writeLog(fileName, data) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filePath = path.join(__dirname, "..", "data", fileName);

    fs.appendFileSync(filePath, data + "\n");
  }

  getTokenById(userId) {
    const tokens = JSON.parse(this.readFile("token.json"));
    return tokens[userId] || null;
  }

  saveToken(userId, token) {
    const tokens = JSON.parse(this.readFile("token.json"));
    tokens[userId] = token;
    const data = JSON.stringify(tokens, null, 4);
    this.writeFile("token.json", data);
  }
}

const fileHelper = new FileHelper();
export default fileHelper;
