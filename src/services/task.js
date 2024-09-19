import colors from "colors";
import delayHelper from "../helpers/delay.js";

class TaskService {
  constructor() {}

  removeDuplicatesTask(arr) {
    const seen = new Set();
    return arr.filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }

  async getTask(user) {
    try {
      const { data } = await user.http.get(4, "tasks");
      if (data?.length) {
        return data;
      } else {
        throw new Error(`Lấy danh sách nhiệm vụ thất bại: ${data?.message}`);
      }
    } catch (error) {
      return -1;
    }
  }

  async startTask(user, task) {
    const param = `tasks/${task.id}/start`;
    let taskName = task.title;
    if (task.progressTarget) {
      taskName = `${task.title} ${task?.progressTarget?.target} ${task?.progressTarget?.postfix}`;
    }
    try {
      const { data } = await user.http.post(4, param, {});
      if (data && data.status === "STARTED") {
        return task.validationType === "KEYWORD"
          ? "READY_FOR_VERIFY"
          : "READY_FOR_CLAIM";
      } else {
        throw new Error(
          `Làm nhiệm vụ ${colors.blue(taskName)} thất bại: ${data?.message}`
        );
      }
    } catch (error) {
      user.log.logError(
        `Làm nhiệm vụ ${colors.blue(taskName)} - ${colors.gray(
          `[${task.id}]`
        )} thất bại: ${error.response?.data?.message}`
      );
      return "NOT_STARTED";
    }
  }
  async verifyTask(user, task) {
    let taskName = task.title;
    const param = `tasks/${task.id}/validate`;
    if (!user?.database?.tasks) {
      user.log.log(
        colors.yellow(
          `Nhiệm vụ ${colors.blue(
            taskName
          )} chưa có câu trả lời, chờ làm lại sau`
        )
      );
      return;
    }
    const taskDatabase = user?.database?.tasks.find((t) => t.id === task.id);
    if (!taskDatabase) {
      user.log.log(
        colors.yellow(
          `Nhiệm vụ ${colors.blue(
            taskName
          )} chưa có câu trả lời, chờ làm lại sau`
        )
      );
      return;
    }
    const body = { keyword: taskDatabase.answer };

    try {
      const { data } = await user.http.post(4, param, body);
      if (data && data.status === "READY_FOR_CLAIM") {
        return "READY_FOR_CLAIM";
      } else {
        throw new Error(
          `Xác nhận nhiệm vụ ${colors.blue(taskName)} thất bại: ${
            data?.message
          }`
        );
      }
    } catch (error) {
      user.log.logError(
        `Xác nhận nhiệm vụ ${colors.blue(taskName)} - ${colors.gray(
          `[${task.id}]`
        )} thất bại: ${error.response?.data?.message}`
      );
      return "NOT_STARTED";
    }
  }

  async claimTask(user, task, showLog = true) {
    const param = `tasks/${task.id}/claim`;
    let taskName = task.title;
    if (task.progressTarget) {
      taskName = `${task.title} ${task.target} ${task.postfix}`;
    }
    try {
      const { data } = await user.http.post(4, param, {});
      if (data && data.status === "FINISHED") {
        if (showLog) {
          user.log.log(
            `Làm nhiệm vụ ${colors.blue(
              taskName
            )} thành công, phần thưởng: ${colors.green(
              task.reward + user.currency
            )}`
          );
        }
        return true;
      } else {
        throw new Error(
          `Claim phần thưởng nhiệm vụ ${colors.blue(taskName)} thất bại: ${
            data?.message
          }`
        );
      }
    } catch (error) {
      if (showLog) {
        user.log.logError(
          `Claim phần thưởng nhiệm vụ ${colors.blue(taskName)} - ${colors.gray(
            `[${task.id}]`
          )} thất bại: ${error.response?.data?.message}`
        );
      }
      return false;
    }
  }

  async handleTaskBasic(user, dataTasks) {
    const skipTasks = ["39391eb2-f031-4954-bd8a-e7aecbb1f192"];
    const tasksErrorStart = [];
    const tasksErrorClaim = [];

    let tasksMerge = [];
    for (const item of dataTasks) {
      tasksMerge = tasksMerge.concat(item.tasks);
    }

    const tasksFilter = tasksMerge.filter(
      (task) =>
        !skipTasks.includes(task.id) &&
        task.status !== "FINISHED" &&
        !task.isHidden
    );
    const tasks = this.removeDuplicatesTask(tasksFilter);

    const taskList = tasks.filter(
      (task) => task.type !== "PROGRESS_TARGET" && task.status !== "STARTED"
    );

    if (taskList.length) {
      user.log.log(
        `Còn ${colors.blue(taskList.length)} nhiệm vụ cơ bản chưa hoàn thành`
      );
    } else {
      user.log.log(
        colors.magenta(
          "Đã làm hết các nhiệm vụ cơ bản (trừ các nhiệm phải làm tay bị bỏ qua)"
        )
      );
    }

    for (const task of tasks) {
      let complete = task.status;
      if (complete === "NOT_STARTED" && task.type !== "PROGRESS_TARGET") {
        complete = await this.startTask(user, task);
        if (complete === "NOT_STARTED") {
          tasksErrorStart.push(task);
        }
        await delayHelper.delay(3);
      }

      if (complete === "READY_FOR_VERIFY") {
        complete = await this.verifyTask(user, task);
      }
      if (complete === "READY_FOR_CLAIM") {
        const statusClaim = await this.claimTask(user, task);
        if (!statusClaim) {
          tasksErrorClaim.push(task);
        }
      }
    }

    if (tasksErrorStart.length || tasksErrorClaim.length) {
      user.log.log(colors.magenta("Chạy lại các nhiệm vụ bị lỗi..."));
      for (const task of tasksErrorStart) {
        let complete = task.status;
        if (complete === "NOT_STARTED" && task.type !== "PROGRESS_TARGET") {
          complete = await this.startTask(user, task);
        }
        if (complete === "READY_FOR_VERIFY") {
          complete = await this.verifyTask(user, task);
        }
        if (complete === "READY_FOR_CLAIM") {
          await this.claimTask(user, task);
        }
      }
      for (const task of tasksErrorClaim) {
        await this.claimTask(user, task);
      }
    }
  }

  async handleTaskWeekly(user, dataTasks, title) {
    const skipTasks = ["39391eb2-f031-4954-bd8a-e7aecbb1f192"];

    const tasksFilter = dataTasks.filter((task) => {
      return (
        !skipTasks.includes(task.id) &&
        !task.subTasks.every((task) => task.status === "FINISHED") &&
        !task.isHidden
      );
    });

    if (tasksFilter.length) {
      user.log.log(
        `Còn ${colors.blue(
          tasksFilter[0].subTasks.length
        )} nhiệm vụ ${colors.blue("Weekly")} chưa hoàn thành`
      );
    } else {
      user.log.log(
        colors.magenta(
          `Đã làm hết các nhiệm vụ ${colors.blue(
            "Weekly"
          )} (trừ các nhiệm phải làm tay bị bỏ qua)`
        )
      );
    }

    for (const taskParent of tasksFilter) {
      user.log.log(
        `Bắt đầu làm nhiệm vụ ${colors.blue(
          taskParent.title
        )}, chờ hoàn thành hết các nhiệm vụ con để nhận thưởng`
      );
      let countDone = 0;
      if (!taskParent?.subTasks) {
        user.log.log(colors.yellow("Không tìm thấy câu hỏi con"));
      } else {
        for (const task of taskParent.subTasks) {
          let complete = task.status;
          if (complete === "FINISHED") {
            countDone++;
            user.log.log(
              `✔️ Đã hoàn thành nhiệm vụ ${colors.blue(
                taskParent.title + " --> " + task.title
              )}`
            );
            continue;
          }
          if (complete === "NOT_STARTED" && task.type !== "PROGRESS_TARGET") {
            complete = await this.startTask(user, task);
            await delayHelper.delay(3);
          }
          if (complete === "READY_FOR_VERIFY") {
            complete = await this.verifyTask(user, task);
          }
          if (complete === "READY_FOR_CLAIM" || complete === "STARTED") {
            const statusClaim = await this.claimTask(user, task, false);
            if (statusClaim) {
              countDone++;
              user.log.log(
                `✔️ Đã hoàn thành nhiệm vụ ${colors.blue(
                  taskParent.title + " --> " + task.title
                )}`
              );
            } else {
              user.log.logError(
                `❌ Làm nhiệm vụ ${colors.blue(
                  taskParent.title + " --> " + task.title
                )} thất bại`
              );
            }
          }
        }
      }
      if (countDone === taskParent?.subTasks?.length) {
        // await this.claimTask(user, taskParent);
        user.log.log(
          colors.magenta(
            `Đã làm hết các nhiệm vụ ${colors.blue(
              "Weekly"
            )} (trừ các nhiệm phải làm tay bị bỏ qua)`
          )
        );
      } else {
        user.log.log(
          colors.yellow(
            `Chưa hoàn thành hết các nhiệm vụ con của task ${colors.blue(
              taskParent.title
            )}`
          )
        );
      }
    }
  }

  async handleTask(user) {
    const maxRetryGetTask = 10;
    let countGetTask = 0;
    let tasks = await this.getTask(user);

    while (tasks === -1 && countGetTask <= maxRetryGetTask) {
      countGetTask++;
      tasks = await this.getTask(user);
    }

    if (countGetTask > maxRetryGetTask) {
      user.log.logError(`Lấy danh sách nhiệm vụ thất bại`);
      return;
    }

    for (const task of tasks) {
      if (task?.sectionType === "DEFAULT") {
        await this.handleTaskBasic(user, task.subSections);
      } else if (task?.sectionType === "WEEKLY_ROUTINE") {
        await this.handleTaskWeekly(user, task.tasks, task.title);
      }
    }

    user.log.log(colors.magenta("Đã làm hết nhiệm vụ"));
  }
}

const taskService = new TaskService();
export default taskService;
