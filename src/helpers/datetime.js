import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
dayjs.extend(duration);

class DatetimeHelper {
  constructor() {}

  formatDuration(seconds) {
    const durationObj = dayjs.duration(seconds, "seconds");
    const hours = durationObj.hours();
    const minutes = durationObj.minutes();
    const secs = durationObj.seconds();

    let result = "";

    if (hours > 0) {
      result += `${hours} giờ `;
    }

    if (minutes > 0 || hours > 0) {
      result += `${minutes} phút `;
    }

    result += `${secs}s`;

    return result.trim();
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600); // Tính số giờ
    const minutes = Math.floor((seconds % 3600) / 60); // Tính số phút
    const remainingSeconds = seconds % 60; // Tính số giây còn lại

    let result = "";

    if (hours > 0) {
      result += `${hours} giờ, `;
    }

    if (minutes > 0 || hours > 0) {
      // Nếu có phút hoặc có giờ
      result += `${minutes} phút, `;
    }

    result += `${remainingSeconds}s`; // Luôn luôn hiển thị giây

    return result.trim();
  }
}

const datetimeHelper = new DatetimeHelper();
export default datetimeHelper;
