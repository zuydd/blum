class DelayHelper {
  constructor() {}

  delay(seconds, msg = null, log = null) {
    if (msg) {
      log.log(msg);
    }
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}

const delayHelper = new DelayHelper();
export default delayHelper;
