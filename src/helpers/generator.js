class GeneratorHelper {
  constructor() {}

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

const generatorHelper = new GeneratorHelper();
export default generatorHelper;
