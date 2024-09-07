** Link cập nhật tool và hướng dẫn chi tiết tại **
https://github.com/zuydd/blum

**_ Hướng dẫn cài đặt _**

- B1: Tải và giải nén tool
- B2: Chạy lệnh: npm install tại thư mục chứa tool (thư mục có chứa file package.json) để cài đặt thư viện bổ trợ
- B3: vào thư mục src -> data, nhập user hoặc query_id vào file users.txt và proxy vào file proxy.txt, không có proxy thì bỏ qua khỏi nhập

**_ Các lệnh chức năng chạy tool _**

- npm run start: dùng để chạy farming/claim, làm nhiệm vụ, điểm danh hàng ngày, chơi game, claim điểm invite.... tóm lại game có gì là nó làm cái đó

🕹️ Các tính năng có trong tool:

- tự động ttham gia tribe để nhận thêm 10% điểm thưởng
- điểm danh hàng ngày
- tự động làm nhiệm vụ
- tự động farming/claim khi tới giờ
- tự động chơi game
- claim điểm invite
- nhận diện proxy tự động, tự động kết nối lại proxy khi bị lỗi. ae ai chạy proxy thì thêm vào file proxy.txt ở dòng ứng với dòng chứa acc muốn chạy proxy đó, acc nào không muốn chạy proxy thì để trống hoặc gõ skip vào
- đa luồng chạy bao nhiêu acc cũng được, không bị block lẫn nhau. Ban đầu khi bắt đầu mỗi luồng sẽ chạy cách nhau 30s, bạn có thể tìm DELAY_ACC = 30 để sửa lại cho phù hợp.

⚠️ Lưu ý:

- Nếu gặp lỗi đăng nhập, làm nhiệm vụ hay chơi game thì là do server của blum nó lỏ chứ không phải lỗi tool, cứ kệ nó, hồi nó quay lại làm sau khi hết lỗi.
- Vì server nó hay lỗi vào khung giờ 14h-24h nên khuyến khích ae chạy tool lần đầu vào khung giờ 4h-12h để chạy mượt mà nhé
- Nếu gặp lỗi đăng nhập không thành công nhiều lần, hãy thử xoá token và lấy lại user hoặc query_id mới
