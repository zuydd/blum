import FingerprintJS2 from "fingerprintjs2";
import fileHelper from "../helpers/file.js";
import generatorHelper from "../helpers/generator.js";

class FakeService {
  constructor() {
    const rawDevices = fileHelper.readFile("phone.json");
    this.devices = JSON.parse(rawDevices);
  }

  randomPhone() {
    const phone = generatorHelper.getRandomElements(this.devices.phone, 1);
    return phone[0];
  }

  randomVersion(phoneName) {
    let iosList = this.devices.ios;
    if (phoneName.includes("iPhone 15")) {
      {
        iosList = this.devices.ios.filter((ver) => ver.includes("17_"));
      }
    }
    const version = generatorHelper.getRandomElements(iosList, 1);
    return version[0];
  }

  randomCanvasCode() {
    const canvasCode = generatorHelper.randomHex(8);
    return canvasCode;
  }

  randomAudio() {
    const r1 = generatorHelper.randomInt(3000000000, 8000000000) + "";
    const audio = "124.0434" + r1;
    return audio;
  }

  generateFingerprint(data) {
    const sortedKeys = Object.keys(data).sort();
    const combinedString = sortedKeys.map((key) => data[key]).join("");
    const fingerprint = FingerprintJS2.x64hash128(combinedString, 32);
    return fingerprint;
  }

  createDeviceInfo(id, indexPayload) {
    const phone = this.randomPhone();
    const version = this.randomVersion(phone.name);
    const canvasCode = this.randomCanvasCode();
    const audio = this.randomAudio();
    const bnc_uuid = null;
    const info =
      id +
      "|" +
      phone.name +
      "|" +
      phone.screen_resolution +
      "|" +
      version +
      "|" +
      canvasCode +
      "|" +
      audio +
      "|" +
      bnc_uuid +
      "|" +
      indexPayload;
    return info;
  }
}

const fakeService = new FakeService();
export default fakeService;
