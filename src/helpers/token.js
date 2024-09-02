class TokenHelper {
  constructor() {}

  isExpired(token) {
    // Tách payload từ JWT token
    const base64Url = token.split(".")[1]; // Phần payload nằm ở phần giữa
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Thay đổi ký tự để đúng chuẩn base64

    // Giải mã base64 thành chuỗi JSON
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    // Chuyển chuỗi JSON thành đối tượng JavaScript
    const payload = JSON.parse(jsonPayload);

    // Lấy thông tin exp từ payload
    const exp = payload.exp;
    // Lấy thời gian hiện tại tính bằng giây
    const currentTime = Math.floor(Date.now() / 1000);
    // So sánh thời gian hết hạn với thời gian hiện tại
    return exp < currentTime;
  }
}

const tokenHelper = new TokenHelper();
export default tokenHelper;
