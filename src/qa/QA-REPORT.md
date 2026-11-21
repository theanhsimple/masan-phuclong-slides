# QA report

## Nội dung — bám theo file đầu vào
Mọi số liệu, sự kiện và nhận định trên slide lấy từ tài liệu “Phân tích chiến lược thu mua Phúc Long của Masan” (Nhóm 2). Số tính thêm duy nhất là định giá ngầm định (75 / ~355 triệu USD) ở slide 10, suy trực tiếp từ giá mua và tỷ lệ cổ phần trong tài liệu, có ghi cách tính trên slide.

Đối chiếu báo chí (chỉ để kiểm tra, **không** đưa lên slide):
| Dữ liệu trong tài liệu | Kết quả đối chiếu |
|---|---|
| 20% / 31% / 34%, 15 tr & 110 tr USD, 3.617,7 tỷ, ~279,6 tr USD, ~455 tr USD | khớp |
| LNST 2025 = 195 tỷ; 9T/2026 = 207 tỷ (+46%); 202 cửa hàng cuối 2025; 44 cửa hàng mở mới | khớp |
| Kiosk lỗ tới 100 tỷ Q4/2022 | khớp |
| 22,8 tr/ngày, +35,1% giao hàng, +39,5% thực phẩm | khớp, báo chí ghi là số năm 2025 |
| Biên gộp ~67,3% | chưa tìm thấy nguồn công khai |

## File
- `validate.py presentation.pptx`: **PASSED** (schema, quan hệ, content types, chart).
- python-pptx mở được; 20 slide đều có title placeholder, 20 ghi chú.
- HTML: 0 lỗi JavaScript; 0 hộp chữ tràn (kiểm tra tự động scrollHeight/scrollWidth trên cả 20 slide).

## Hiển thị
- HTML: render 20 slide (preview/html) + khung hình giữa animation (qa/motion: slide 2, 5, 6, 10, 11, 13, 19, tổng quan, ghi chú).
- PPTX: render qua LibreOffice (preview/powerpoint), so từng slide với HTML.
- Đã sửa trong QA: chữ tràn 9 hộp số lớn; tiêu đề slide 16 đè nhãn biểu đồ; pill “The Sherpa Company Limited” xuống dòng; chú thích slide 14 vượt lề phải; hơi nước đè miệng tách; vòng 85% sai độ dày trong PPTX (đổi sang block arc gốc); dãn dòng PPTX lệch HTML (đổi sang dãn dòng tuyệt đối); nhãn biểu đồ chồng nhau khi morph; slide định giá chuyển lên ngay sau slide sở hữu để morph cột hoạt động.

## Giới hạn còn lại (ghi nhận trung thực)
- Animation PowerPoint: XML đã qua validator nhưng **chưa chạy thử trong PowerPoint thật** (môi trường không có PowerPoint; LibreOffice không phát animation).
- Trong ảnh render LibreOffice, chữ trong pill hơi thấp ~3–4px so với giữa; PowerPoint căn giữa theo metric font nên thường không bị.
- Ảnh cửa hàng gốc chỉ 515×388 px — đã phóng và làm nét, nhưng vẫn nên thay ảnh độ phân giải cao.
- Không có Reveal.js/GSAP/Three.js (máy không có mạng để cài) → engine riêng bằng Web Animations API, đủ: điều hướng phím, tổng quan, toàn màn hình, ghi chú, morph, reveal, fragment.

## Parity checklist (HTML ↔ PPTX)
| # | Slide | Nội dung | Phân cấp | Visual chính | Màu | Bố cục | Ghi chú khác biệt |
|---|---|---|---|---|---|---|---|
| 1 | Cover | ✅ | ✅ | ✅ tách trà | ✅ | ✅ | HTML có hơi nước/gợn sóng chuyển động |
| 2 | Mục lục | ✅ | ✅ | ✅ | ✅ | ✅ | |
| 3 | Toàn cảnh | ✅ | ✅ | ✅ vòng 85% | ✅ | ✅ | PPTX: block arc + Wheel |
| 4 | Masan | ✅ | ✅ | ✅ | ✅ | ✅ | |
| 5 | Point of Life | ✅ | ✅ | ✅ hub | ✅ | ✅ | Morph cả hai bản |
| 6 | Phúc Long | ✅ | ✅ | ✅ ảnh + timeline | ✅ | ✅ | |
| 7 | Bối cảnh | ✅ | ✅ | ✅ nền chia đôi | ✅ | ✅ | |
| 8 | Động cơ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| 9 | Ba bước | ✅ | ✅ | ✅ biểu đồ cột | ✅ | ✅ | PPTX: chart gốc |
| 10 | Định giá | ✅ | ✅ | ✅ biểu đồ cột | ✅ | ✅ | Morph cột chỉ có ở HTML; PPTX Fade |
| 11 | Ý nghĩa | ✅ | ✅ | ✅ bậc thang | ✅ | ✅ | |
| 12 | 7 nguồn | ✅ | ✅ | ✅ trục phân kỳ | ✅ | ✅ | |
| 13 | Kiosk | ✅ | ✅ | ✅ | ✅ | ✅ | 1 bước bấm ở cả hai bản |
| 14 | Chuỗi giá trị | ✅ | ✅ | ✅ | ✅ | ✅ | |
| 15 | Kết luận | ✅ | ✅ | ✅ | ✅ | ✅ | |
| 16 | Thành quả | ✅ | ✅ | ✅ biểu đồ + KPI | ✅ | ✅ | |
| 17 | Kiosk 2021–2026 | ✅ | ✅ | ✅ timeline | ✅ | ✅ | |
| 18 | Giới hạn | ✅ | ✅ | ✅ | ✅ | ✅ | |
| 19 | Bài học | ✅ | ✅ | ✅ | ✅ | ✅ | 3 bước bấm ở cả hai bản |
| 20 | Kết | ✅ | ✅ | ✅ tách trà | ✅ | ✅ | |
