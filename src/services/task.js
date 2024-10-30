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

  async getTask(user, lang) {
    try {
      const { data } = await user.http.get(4, "tasks");
      if (data?.length) {
        return data;
      } else {
        throw new Error(`${lang?.task?.get_task_error_msg}: ${data?.message}`);
      }
    } catch (error) {
      return -1;
    }
  }

  async startTask(user, lang, task) {
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
        const msg = lang?.task?.do_task_error_msg.replace(
          "XXX",
          colors.blue(taskName)
        );
        throw new Error(`${msg}: ${data?.message}`);
      }
    } catch (error) {
      const msg = lang?.task?.do_task_error_msg.replace(
        "XXX",
        `${colors.blue(taskName)} - ${colors.gray(`[${task.id}]`)}`
      );
      user.log.logError(`${msg}: ${error.response?.data?.message}`);
      return "NOT_STARTED";
    }
  }
  async verifyTask(user, lang, task) {
    let taskName = task.title;
    const param = `tasks/${task.id}/validate`;
    if (!user?.database?.tasks) {
      const msg = lang?.task?.task_not_answer.replace(
        "XXX",
        colors.blue(taskName)
      );
      user.log.log(colors.yellow(msg));
      return;
    }
    const taskDatabase = user?.database?.tasks.find((t) => t.id === task.id);
    if (!taskDatabase) {
      const msg = lang?.task?.task_not_answer.replace(
        "XXX",
        colors.blue(taskName)
      );
      user.log.log(colors.yellow(msg));
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

  async claimTask(user, lang, task, showLog = true) {
    const param = `tasks/${task.id}/claim`;
    let taskName = task.title;
    if (task.progressTarget) {
      taskName = `${task.title} ${task.target} ${task.postfix}`;
    }
    try {
      const { data } = await user.http.post(4, param, {});
      if (data && data.status === "FINISHED") {
        if (showLog) {
          const msg = lang?.task?.do_task_success.replace(
            "XXX",
            colors.blue(taskName)
          );
          user.log.log(`${msg}: ${colors.green(task.reward + user.currency)}`);
        }
        return true;
      } else {
        const msg = lang?.task?.claim_task_failed.replace(
          "XXX",
          colors.blue(taskName)
        );
        throw new Error(`${msg}: ${data?.message}`);
      }
    } catch (error) {
      if (showLog) {
        const msg = lang?.task?.claim_task_failed.replace(
          "XXX",
          `${colors.blue(taskName)} - ${colors.gray(`[${task.id}]`)}`
        );
        user.log.logError(`${msg}: ${error.response?.data?.message}`);
      }
      return false;
    }
  }

  async handleTaskBasic(user, lang, dataTasks, title) {
    const skipTasks = ["39391eb2-f031-4954-bd8a-e7aecbb1f192"];

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
      const msg = lang?.task?.tasks_remaining
        .replace("XXX", colors.blue(taskList.length))
        .replace("YYY", colors.blue(title));
      user.log.log(msg);
    } else {
      const msg = lang?.task?.tasks_completed_skip.replace(
        "XXX",
        colors.blue(title)
      );
      user.log.log(colors.magenta(msg));
    }

    await this.handleSingleTask(user, lang, tasks);
  }

  async handleTaskMultiple(user, lang, dataTasks, title) {
    const skipTasks = ["39391eb2-f031-4954-bd8a-e7aecbb1f192"];

    const tasksFilter = dataTasks.filter((task) => {
      if (task?.subTasks) {
        return (
          !skipTasks.includes(task.id) &&
          !task.subTasks.every((task) => task.status === "FINISHED") &&
          !task.isHidden
        );
      } else {
        return (
          !skipTasks.includes(task.id) &&
          !task.status === "FINISHED" &&
          !task.isHidden
        );
      }
    });

    if (tasksFilter.length) {
      const msg = lang?.task?.tasks_remaining
        .replace("XXX", colors.blue(tasksFilter.length))
        .replace("YYY", colors.blue(title));
      user.log.log(msg);
    } else {
      const msg = lang?.task?.tasks_completed_skip.replace(
        "XXX",
        colors.blue(title)
      );
      user.log.log(colors.magenta(msg));
    }

    for (const taskParent of tasksFilter) {
      const msg = lang?.task?.start_task_parent_msg.replace(
        "XXX",
        colors.blue(taskParent.title)
      );
      user.log.log(msg);

      if (!taskParent?.subTasks) {
        await this.handleSingleTask(user, lang, [taskParent]);
      } else {
        let countDone = await this.handleSubTask(
          user,
          lang,
          taskParent?.subTasks,
          taskParent?.title
        );
        if (countDone === taskParent?.subTasks?.length) {
          // await this.claimTask(user, taskParent);
          const msg = lang?.task?.tasks_completed_skip.replace(
            "XXX",
            colors.blue(taskParent.title)
          );
          user.log.log(colors.magenta(msg));
        } else {
          user.log.log(
            colors.yellow(
              `${lang?.task?.not_completed_subtask} ${colors.blue(
                taskParent.title
              )}`
            )
          );
        }
      }
    }
  }

  async handleSingleTask(user, lang, tasks) {
    const tasksErrorStart = [];
    const tasksErrorClaim = [];
    for (const task of tasks) {
      let complete = task.status;
      if (complete === "NOT_STARTED" && task.type !== "PROGRESS_TARGET") {
        complete = await this.startTask(user, lang, task);
        if (complete === "NOT_STARTED") {
          tasksErrorStart.push(task);
        }
        await delayHelper.delay(3);
      }

      if (complete === "READY_FOR_VERIFY") {
        complete = await this.verifyTask(user, lang, task);
      }
      if (complete === "READY_FOR_CLAIM") {
        const statusClaim = await this.claimTask(user, lang, task);
        if (!statusClaim) {
          tasksErrorClaim.push(task);
        }
      }
    }

    if (tasksErrorStart.length || tasksErrorClaim.length) {
      user.log.log(colors.magenta(lang?.task?.retry_task_error));
      for (const task of tasksErrorStart) {
        let complete = task.status;
        if (complete === "NOT_STARTED" && task.type !== "PROGRESS_TARGET") {
          complete = await this.startTask(user, lang, task);
        }
        if (complete === "READY_FOR_VERIFY") {
          complete = await this.verifyTask(user, lang, task);
        }
        if (complete === "READY_FOR_CLAIM") {
          await this.claimTask(user, lang, task);
        }
      }
      for (const task of tasksErrorClaim) {
        await this.claimTask(user, lang, task);
      }
    }
  }

  async handleSubTask(user, lang, subTask, nameTaskParent) {
    let countDone = 0;
    for (const task of subTask) {
      let complete = task.status;
      if (complete === "FINISHED") {
        countDone++;
        user.log.log(
          `✔️ ${lang?.task?.task_done_msg} ${colors.blue(
            nameTaskParent + " --> " + task.title
          )}`
        );
        continue;
      }
      if (complete === "NOT_STARTED" && task.type !== "PROGRESS_TARGET") {
        complete = await this.startTask(user, lang, task);
        await delayHelper.delay(3);
      }
      if (complete === "READY_FOR_VERIFY") {
        complete = await this.verifyTask(user, lang, task);
      }
      if (complete === "READY_FOR_CLAIM" || complete === "STARTED") {
        const statusClaim = await this.claimTask(user, lang, task, false);
        if (statusClaim) {
          countDone++;
          user.log.log(
            `✔️ ${lang?.task?.task_done_msg} ${colors.blue(
              nameTaskParent + " --> " + task.title
            )}`
          );
        } else {
          const msg = lang?.task?.task_failed_msg.replace(
            "XXX",
            `${colors.blue(nameTaskParent + " --> " + task.title)}`
          );
          user.log.logError(msg);
        }
      }
    }
    return countDone;
  }

  async handleTask(user, lang) {
    const maxRetryGetTask = 10;
    let countGetTask = 0;
    let tasks = await this.getTask(user, lang);

    while (tasks === -1 && countGetTask <= maxRetryGetTask) {
      countGetTask++;
      tasks = await this.getTask(user, lang);
    }

    if (countGetTask > maxRetryGetTask) {
      user.log.logError(lang?.task?.get_task_error_msg);
      return;
    }

    for (const task of tasks) {
      if (task?.sectionType === "DEFAULT") {
        await this.handleTaskBasic(
          user,
          lang,
          task.subSections,
          task.sectionType
        );
      } else {
        await this.handleTaskMultiple(user, lang, task.tasks, task.sectionType);
      }
    }

    user.log.log(colors.magenta(lang?.task?.task_completed));
  }
}

const taskService = new TaskService();
export default taskService;
