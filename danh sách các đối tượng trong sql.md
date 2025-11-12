Đã nhận --- dưới đây là **Danh sách đã được cập nhật, chuẩn hoá và sẵn
sàng để chèn vào script SQL** theo tất cả quyết định của bạn (mã ngắn,
mật khẩu thuần, HopDong không lưu biển, KhachHang_BienSo cho phép
update, v.v.).

Mình giữ nguyên thứ tự bạn gửi rồi chỉnh vài ghi chú quan trọng để dev
dễ hiểu.

# 1) DANH SÁCH BẢNG (FINAL)

![](media/image1.png){width="6.5in" height="3.6256944444444446in"}

### Ghi chú quan trọng về bảng

-   **Mã tự sinh ngắn**: KH001, XE001, HS001, HD001, \... (triggers sẽ
    sinh mã theo format này).

-   **TaiKhoan.Password**: lưu **thuần** (demo) như bạn yêu cầu --- *sẽ
    không hash*.

-   **BienSoXe** cho phép update (không chặn), một khách có thể có nhiều
    biển (1:N) --- bạn đã chọn cho phép.

-   HopDong tham chiếu MaXe (VIN) --- khi in hợp đồng nếu cần biển thì
    join BienSoXe theo MaKH **(không lưu snapshot biển)**.

# 2) DANH SÁCH TRIGGER (FINAL)

> Đã cập nhật :\
> -các identity:\
> \
> KhachHangXe ID 1
>
> MaTranTinhPhi ID 1
>
> MaTranThamDinh ID 1
>
> HoSoThamDinh_ChiTiet MaHSC_ID 1
>
> HopDongRelation ID 1
>
> sysdiagrams diagram_id 1
>
> Trigger
>
> ![](media/image2.png){width="6.5in" height="1.9902777777777778in"}

# 3) DANH SÁCH STORED PROCEDURE (FINAL)

1.  **sp_TinhDiemThamDinh** --- Tính tổng điểm (sum) dựa trên
    HoSoThamDinh_ChiTiet cho 1 MaHS

2.  **sp_XacDinhRiskLevel** --- Quy đổi RiskScore → RiskLevel (ví dụ:
    \<=15: ACCEPT, 16--25: REVIEW/ADJUST_FEE, \>25: REJECT)

3.  **sp_TinhPhiBaoHiem** --- Tính phí: Phi = GiaTriXe \* TyLePhiCoBan
    (từ GoiBaoHiem) \* HeSo (từ MaTranTinhPhi theo RiskLevel và Gói)

4.  **sp_TaoHopDong** --- Sinh HopDong từ HoSoThamDinh đã duyệt (nhận
    MaHS + MaGoi + các tham số)

5.  **sp_TaoThanhToan** --- Tạo bản ghi thanh toán trong
    ThanhToanHopDong (thu / refund)

6.  **sp_HoanTienHopDong** --- Tạo giao dịch refund và (tuỳ) trả về số
    tiền hoàn trả

7.  **sp_RenewHopDong** --- Tái tục: tạo HopDong mới từ HopDong cũ +
    insert HopDongRelation (TAI_TUC)

8.  **sp_ChuyenQuyenHopDong** --- Chuyển quyền: tạo HopDong mới cho chủ
    mới, ghi HopDongRelation (CHUYEN_QUYEN) --- *lưu ý: nếu chuyển quyền
    cần thẩm định lại theo nghiệp vụ bạn mô tả (có thể gọi sp_TaoHopDong
    qua flow thẩm định mới)*

![](media/image3.png){width="6.5in" height="3.645138888888889in"}

# 4) Các quy ước & ghi chú vận hành (tóm tắt)

-   **Gói bảo hiểm** mặc định: CoBan, MoRong, ToanDien. Bảng GoiBaoHiem
    sẽ chứa TyLePhiCoBan (ví dụ 1.5 → 1.5%) để sp_TinhPhiBaoHiem dùng.

-   **RiskLevel**: mapping do bạn quyết (mình sẽ dùng LOW / MEDIUM /
    HIGH ).

-   **Mật khẩu demo**: lưu plain text

-   **Triggers & SPs**: mình sẽ viết theo chuẩn SQL Server (T-SQL) và để
    comment rõ từng bước.

Nếu bạn đồng ý danh sách này, mình sẽ tiến hành:

1.  Generate file **database_full_script.sql** (tạo bảng, ràng buộc FK,
    index, triggers, stored procedures, và dữ liệu mẫu cho GoiBaoHiem
    với 3 gói).

2.  Gửi file .sql cho bạn (hoặc paste vào chat nếu bạn muốn xem trực
    tiếp).

Trả lời 1 dòng: **"OK generate SQL"** để mình bắt đầu.

Về cấu trúc gói bảo hiểm

Ok bạn. Đây là định nghĩa chuẩn của 3 gói bảo hiểm mà chúng ta đã thống
nhất (vừa INSERT ở bước trước).

Việc thống nhất này rất quan trọng để đảm bảo logic tính phí
(MaTranTinhPhi) và tạo hợp đồng sau này.

**1. 🥇 Gói Cơ Bản (Giả định: GBH0001)**

-   **Tên gói:** Gói Cơ Bản

-   **Tỷ lệ phí cơ bản:** 1.5%

-   **Mô tả:** Chỉ bao gồm các quyền lợi tối thiểu.

    -   Bảo hiểm Trách nhiệm Dân sự (TNDS) bắt buộc.

    -   Bảo hiểm thiệt hại thân vỏ xe ở mức cơ bản (ví dụ: va chạm).

**2. 🥈 Gói Nâng Cao (Giả định: GBH0002)**

-   **Tên gói:** Gói Nâng Cao

-   **Tỷ lệ phí cơ bản:** 2.0%

-   **Mô tả:** Bao gồm **toàn bộ Gói Cơ Bản**, và bổ sung thêm các rủi
    ro phổ biến:

    -   Bảo hiểm mất cắp (toàn bộ xe).

    -   Bảo hiểm thủy kích (xe bị hư hỏng do ngập nước).

**3. 🥉 Gói Toàn Diện (Giả định: GBH0003)**

-   **Tên gói:** Gói Toàn Diện

-   **Tỷ lệ phí cơ bản:** 2.5%

-   **Mô tả:** Bao gồm **toàn bộ Gói Nâng Cao**, và mở rộng ra gần như
    mọi rủi ro:

    -   Bảo hiểm mọi rủi ro (All Risks), bao gồm các thiệt hại không rõ
        nguyên nhân, thiên tai khác, v.v.
