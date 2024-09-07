import colors from "colors";

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

  async getTaskList(user) {
    const skipTasks = ["39391eb2-f031-4954-bd8a-e7aecbb1f192"];
    try {
      const { data } = await user.http.get(0, "tasks");
      if (data) {
        const dataTasks = data[0].subSections;

        let tasks = [];
        for (const item of dataTasks) {
          tasks = tasks.concat(item.tasks);
        }

        const taskFilter = tasks.filter(
          (task) =>
            !skipTasks.includes(task.id) &&
            task.status !== "FINISHED" &&
            !task.isHidden
        );
        return this.removeDuplicatesTask(taskFilter);
      } else {
        throw new Error(`Lấy danh sách nhiệm vụ thất bại: ${data?.message}`);
      }
    } catch (error) {
      user.log.logError(
        `Lấy danh sách nhiệm vụ thất bại: ${error.response?.data?.message}`
      );
      return [];
    }
  }

  async startTask(user, task) {
    const param = `tasks/${task.id}/start`;
    let taskName = task.title;
    if (task.progressTarget) {
      taskName = `${task.title} ${task.target} ${task.postfix}`;
    }
    try {
      const { data } = await user.http.post(0, param, {});
      if (data && data.status === "STARTED") {
        return "READY_FOR_CLAIM";
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

  async claimTask(user, task) {
    const param = `tasks/${task.id}/claim`;
    let taskName = task.title;
    if (task.progressTarget) {
      taskName = `${task.title} ${task.target} ${task.postfix}`;
    }
    try {
      const { data } = await user.http.post(0, param, {});
      if (data && data.status === "FINISHED") {
        user.log.log(
          `Làm nhiệm vụ ${colors.blue(
            taskName
          )} thành công, phần thưởng: ${colors.green(
            task.reward + user.currency
          )}`
        );
        return true;
      } else {
        throw new Error(
          `Claim phần thưởng nhiệm vụ ${colors.blue(taskName)} thất bại: ${
            data?.message
          }`
        );
      }
    } catch (error) {
      user.log.logError(
        `Claim phần thưởng nhiệm vụ ${colors.blue(taskName)} - ${colors.gray(
          `[${task.id}]`
        )} thất bại: ${error.response?.data?.message}`
      );
      return false;
    }
  }

  async handleTask(user) {
    const tasks = await this.getTaskList(user);

    if (!tasks.length) {
      user.log.log(colors.magenta("Đã làm hết nhiệm vụ"));
      return;
    }

    const tasksErrorStart = [];
    const tasksErrorClaim = [];
    for (const task of tasks) {
      let complete = task.status;
      if (complete === "NOT_STARTED" && task.type !== "PROGRESS_TARGET") {
        complete = await this.startTask(user, task);
        if (complete === "NOT_STARTED") {
          tasksErrorStart.push(task);
        }
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
        if (complete === "READY_FOR_CLAIM") {
          await this.claimTask(user, task);
        }
      }
      for (const task of tasksErrorClaim) {
        await this.claimTask(user, task);
      }
    }
  }
}

const taskService = new TaskService();
export default taskService;
