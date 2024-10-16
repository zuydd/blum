class GeneratorHelper {
  constructor() {}

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ue) => {
      const Yi = (Math.random() * 16) | 0; // Tạo số ngẫu nhiên từ 0 đến 15 (số thập lục phân)
      return (ue === "x" ? Yi : (Yi & 3) | 8).toString(16); // Chuyển đổi số ngẫu nhiên thành chữ cái thập lục phân (hex)
    });
  }
}

const generatorHelper = new GeneratorHelper();
export default generatorHelper;
