# Motion specification

Mọi chuyển động được khai báo **một lần** trong `spec/presentation.json` (`m: { a, d }` trên từng phần tử, `step` cho bước bấm, `morph` cho đối tượng dùng chung giữa hai slide) và được dịch sang cả HTML lẫn PowerPoint.

## Token
| Token | Giá trị |
|---|---|
| Ease out | `cubic-bezier(.16,1,.3,1)` |
| Ease in-out | `cubic-bezier(.65,0,.35,1)` |
| Micro / reveal / object / transition | 300 / 640–760 / 820–1100 / 650–900 ms |
| Stagger | 45 ms/từ (tiêu đề) · 90–220 ms giữa các khối |

## Từ vựng chuyển động
| Mã | HTML (Web Animations API) | PowerPoint |
|---|---|---|
| `words` | Từng từ trồi lên trong mặt nạ | Fade |
| `rise` / `fade` / `scale` | Trồi 30px + mờ dần / mờ dần / phóng 0.84→1 | Fade |
| `mask` | Mặt nạ mở trái→phải + ảnh thu từ 1.18 | Wipe từ trái |
| `grow` | Cột/khối mọc từ đáy, nhãn số đếm lên | Wipe từ dưới |
| `draw` | Nét kẻ tự vẽ; vòng 85% quay vẽ | Wipe trái/trên · Wheel |
| `count` | Đếm số 0 → giá trị (định dạng vi-VN) | Fade |
| `morph` | FLIP: đối tượng bay & biến hình sang vị trí mới | Morph (slide 4→5) |

## Chuyển slide (HTML)
Slide cũ mờ + nhoè 8px + thu 0.985; slide mới phóng 1.025 → 1. Hai cặp “shared-object”: **WinCommerce → WinMart+ (4→5)** và **3 cột sở hữu → 3 cột định giá (9→10)**.

## Nền sống (chỉ HTML)
Quầng sáng trôi chậm 16–26 s · gợn sóng trong tách trà · lá trà xoay · hơi nước bay lên · parallax theo chuột (nền 14px, hoạ tiết −22px).

## Nhịp toàn bộ
Tĩnh (mục lục) → mở dần (bối cảnh, động cơ) → cảnh mạnh (morph, biểu đồ mọc) → bấm từng bước (kiosk, bài học) → khoảng lặng (slide kết luận hổ phách chỉ có chữ).

## Khả năng tiếp cận
`prefers-reduced-motion`: tắt toàn bộ animation, hiện trạng thái cuối. Không thông tin nào chỉ nằm trong chuyển động.
