import colors from "colors";
import dayjs from "dayjs";
import datetimeHelper from "../helpers/datetime.js";
import delayHelper from "../helpers/delay.js";
import fileHelper from "../helpers/file.js";
import generatorHelper from "../helpers/generator.js";
import authService from "../services/auth.js";
import dailyService from "../services/daily.js";
import farmingClass from "../services/farming.js";
import gameService from "../services/game.js";
import inviteClass from "../services/invite.js";
import keyService from "../services/key.js";
import server from "../services/server.js";
import taskService from "../services/task.js";
import tribeService from "../services/tribe.js";
import userService from "../services/user.js";

const VERSION = "v0.2.4";
// Change language
// vi: Tiếng Việt
// en: English
// ru: русский язык
// id: Bahasa Indonèsia
// zh: 中国话
const LANGUAGE = "vi";
// Điều chỉnh khoảng cách thời gian chạy vòng lặp đầu tiên giữa các luồng tránh bị spam request (tính bằng giây)
const DELAY_ACC = 10;
// Đặt số lần thử kết nối lại tối đa khi proxy lỗi, nếu thử lại quá số lần cài đặt sẽ dừng chạy tài khoản đó và ghi lỗi vào file log
const MAX_RETRY_PROXY = 20;
// Đặt số lần thử đăng nhập tối đa khi đăng nhập lỗi, nếu thử lại quá số lần cài đặt sẽ dừng chạy tài khoản đó và ghi lỗi vào file log
const MAX_RETRY_LOGIN = 20;
// Cài đặt thời gian KHÔNG chơi game tránh những khoảng thời gian lỗi server. ví dụ nhập [1, 2, 3, 8, 20] thì sẽ không chơi game trong các khung giờ 1, 2, 3, 8, 20 giờ
const TIME_PLAY_GAME = [];
// Cài đặt đếm ngược đến lần chạy tiếp theo
const IS_SHOW_COUNTDOWN = true;
const countdownList = [];

const lang = fileHelper.getLang(LANGUAGE);
// console.log(lang);

let database = {};
setInterval(async () => {
  const data = await server.getData();
  if (data) {
    database = data;
    server.checkVersion(VERSION, data);
  }
}, generatorHelper.randomInt(20, 40) * 60 * 1000);

const run = async (user, index) => {
  let countRetryProxy = 0;
  let countRetryLogin = 0;
  await delayHelper.delay((user.index - 1) * DELAY_ACC);
  while (true) {
    // Lấy lại dữ liệu từ server zuydd
    if (database?.ref) {
      user.database = database;
    }

    countdownList[index].running = true;
    // Kiểm tra kết nối proxy
    let isProxyConnected = false;
    while (!isProxyConnected) {
      const ip = await user.http.checkProxyIP();
      if (ip === -1) {
        user.log.logError(lang?.index?.error_proxy);
        countRetryProxy++;
        if (countRetryProxy >= MAX_RETRY_PROXY) {
          break;
        } else {
          await delayHelper.delay(30);
        }
      } else {
        countRetryProxy = 0;
        isProxyConnected = true;
      }
    }
    try {
      if (countRetryProxy >= MAX_RETRY_PROXY) {
        const dataLog = `[No ${user.index} _ ID: ${
          user.info.id
        } _ Time: ${dayjs().format("YYYY-MM-DDTHH:mm:ssZ[Z]")}] ${
          lang?.index?.error_proxy_log
        } - ${user.proxy}`;
        fileHelper.writeLog("log.error.txt", dataLog);
        break;
      }

      if (countRetryLogin >= MAX_RETRY_LOGIN) {
        const dataLog = `[No ${user.index} _ ID: ${
          user.info.id
        } _ Time: ${dayjs().format("YYYY-MM-DDTHH:mm:ssZ[Z]")}] ${
          lang?.index?.error_login_log
        } ${MAX_RETRY_LOGIN} ${lang?.index?.times}`;
        fileHelper.writeLog("log.error.txt", dataLog);
        break;
      }
    } catch (error) {
      user.log.logError(lang?.index?.write_log_error);
    }

    // Đăng nhập tài khoản
    const login = await authService.handleLogin(user, lang);
    if (!login.status) {
      countRetryLogin++;
      await delayHelper.delay(60);
      continue;
    } else {
      countRetryLogin = 0;
    }

    await dailyService.checkin(user, lang);
    await tribeService.handleTribe(user, lang);
    if (user.database?.skipHandleTask) {
      user.log.log(colors.yellow(lang?.index?.skip_task_message));
    } else {
      await taskService.handleTask(user, lang);
    }

    await inviteClass.handleInvite(user, lang);
    let awaitTime = await farmingClass.handleFarming(
      user,
      lang,
      login.profile?.farming
    );
    countdownList[index].time = (awaitTime + 1) * 60;
    countdownList[index].created = dayjs().unix();

    let minutesUntilNextGameStart = -1;
    if (user.database?.skipHandleGame) {
      user.log.log(colors.yellow(lang?.index?.skip_game_message));
    } else {
      minutesUntilNextGameStart = await gameService.handleGame(
        user,
        lang,
        login.profile?.playPasses,
        TIME_PLAY_GAME
      );
    }

    if (minutesUntilNextGameStart !== -1) {
      const offset = dayjs().unix() - countdownList[index].created;
      const countdown = countdownList[index].time - offset;
      if (minutesUntilNextGameStart * 60 < countdown) {
        countdownList[index].time = (minutesUntilNextGameStart + 1) * 60;
        countdownList[index].created = dayjs().unix();
      }
    }
    countdownList[index].running = false;
    await delayHelper.delay((awaitTime + 1) * 60);
  }
};

console.log(
  colors.yellow.bold(`=============  ${lang?.index?.copyright}  =============`)
);
console.log(lang?.index?.copyright2);
console.log(
  `Telegram: ${colors.green(
    "https://t.me/zuydd"
  )}  ___  Facebook: ${colors.blue("https://www.facebook.com/zuy.dd")}`
);
console.log(
  `🚀 ${lang?.index?.update_guide} 👉 ${colors.gray(
    "https://github.com/zuydd"
  )} 👈`
);
console.log("");
console.log(
  `${lang?.index?.buy_key_info} 👉 ${colors.blue(
    "https://zuy-web.vercel.app/blum"
  )}`
);
console.log("");
console.log("");

await server.checkVersion(VERSION, lang);
await server.showNoti(lang);
console.log("");
const users = await userService.loadUser(lang);

await keyService.handleApiKey(lang);

for (const [index, user] of users.entries()) {
  countdownList.push({
    running: true,
    time: 480 * 60,
    created: dayjs().unix(),
  });
  run(user, index);
}

if (IS_SHOW_COUNTDOWN && users.length) {
  let isLog = false;
  setInterval(async () => {
    const isPauseAll = !countdownList.some((item) => item.running === true);

    if (isPauseAll) {
      await delayHelper.delay(1);
      if (!isLog) {
        console.log(
          "========================================================================================="
        );
        isLog = true;
      }
      const minTimeCountdown = countdownList.reduce((minItem, currentItem) => {
        // bù trừ chênh lệch
        const currentOffset = dayjs().unix() - currentItem.created;
        const minOffset = dayjs().unix() - minItem.created;
        return currentItem.time - currentOffset < minItem.time - minOffset
          ? currentItem
          : minItem;
      }, countdownList[0]);
      const offset = dayjs().unix() - minTimeCountdown.created;
      const countdown = minTimeCountdown.time - offset;
      process.stdout.write("\x1b[K");
      process.stdout.write(
        colors.white(
          `[${dayjs().format("DD-MM-YYYY HH:mm:ss")}] ${
            lang?.index?.countdown_message
          } ${colors.blue(datetimeHelper.formatTime(countdown))}     \r`
        )
      );
    } else {
      isLog = false;
    }
  }, 1000);

  process.on("SIGINT", () => {
    console.log("");
    process.stdout.write("\x1b[K"); // Xóa dòng hiện tại từ con trỏ đến cuối dòng
    process.exit(); // Thoát khỏi quá trình
  });
}

setInterval(() => {}, 1000); // Để script không kết thúc ngay
