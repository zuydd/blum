class DeviceService {
  constructor() {}

  initDataDevice(device) {
    const arrDevice = device.split("|");
    const deviceName = arrDevice[1];
    const resolution = arrDevice[2];
    const version = arrDevice[3];
    const versionDot = version.replaceAll("_", ".");
    const canvas_code = arrDevice[4];
    const audio = arrDevice[5];

    const deviceInfoWithoutFingerprint = {
      screen_resolution: resolution,
      available_screen_resolution: resolution,
      system_version: `iOS ${versionDot}`,
      brand_model: "mobile Apple iPhone ",
      system_lang: "vi-VN",
      timezone: "GMT+07:00",
      timezoneOffset: -420,
      user_agent: `Mozilla/5.0 (iPhone; CPU iPhone OS ${version} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`,
      list_plugin:
        "PDF Viewer,Chrome PDF Viewer,Chromium PDF Viewer,Microsoft Edge PDF Viewer,WebKit built-in PDF",
      canvas_code,
      webgl_vendor: "Apple Inc.",
      webgl_renderer: "Apple GPU",
      audio,
      platform: "iPhone",
      web_timezone: "Asia/Saigon",
      device_name: "WebKit V605.1.15 (iOS)",
      device_id: "",
      related_device_ids: "",
    };

    return {
      userAgent: deviceInfoWithoutFingerprint.user_agent,
    };
  }
}

const deviceService = new DeviceService();
export default deviceService;
