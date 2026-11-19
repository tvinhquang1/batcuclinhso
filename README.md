# Bát Cực Linh Số

Web tĩnh phân tích năng lượng số điện thoại theo phương pháp Bát Cực Linh Số (tài liệu Kim Tâm Cát). Người dùng nhập số điện thoại, giới tính, năm sinh; ứng dụng tách cặp số, phân loại theo 8 sao (Bát Tinh), xét quy tắc số 0/5, cảnh báo tổ hợp cấm kỵ và đưa ra điểm năng lượng cùng phân tích 4 khía cạnh: Tài Lộc, Tình Cảm, Sự Nghiệp, Sức Khỏe.

Kết quả mang tính chất tham khảo.

## Cách chạy

Không cần build hay cài đặt.

- Mở trực tiếp `index.html` bằng trình duyệt, hoặc
- Serve tĩnh thư mục gốc, ví dụ:

```bash
python3 -m http.server 8000
# mở http://localhost:8000
```

Lịch sử phân tích lưu trong `localStorage` của trình duyệt (key `bat_cuc_db`, tối đa 50 bản ghi gần nhất).

## Cấu trúc

```
index.html        Giao diện: form nhập, kết quả, lịch sử
css/style.css     Style
js/config.js      Dữ liệu: STAR_CONFIG (8 sao), ZERO_FIVE_RULES, STAR_INTERACTIONS, CRITICAL_WARNINGS
js/analyzer.js    NumberAnalyzer: tách cặp số, phân loại sao, số 0/5, cảnh báo, tính điểm, khuyến nghị
js/app.js         Xử lý form, render kết quả, lưu/xem/xóa lịch sử, sao chép kết quả
```

Luồng phân tích (`NumberAnalyzer.analyze`): `extractPairs` → `classifyStars` → `analyzeSpecialNumbers` → `checkCriticalWarnings` → `calculateScore` → `generateRecommendations` → `analyzeByGoal`.
