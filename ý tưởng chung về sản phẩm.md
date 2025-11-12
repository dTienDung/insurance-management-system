Ý tưởng chung về sản phẩm

Các đối tượng chính mà tôi mong muốn về database

  -----------------------------------------------------------------------
  → Tạo bảng HopDong_Log để log lại các thay đổi trạng thái (phục vụ
  audit & báo cáo).
  -----------------------------------------------------------------------
  → Gom lại thành **1 danh sách trạng thái chuẩn**.

  → Trong MaTranTinhPhi thêm cột MaGoi

  → Backend tự thêm record "sở hữu bắt đầu từ ngày hôm nay".
  -----------------------------------------------------------------------

OK, bỏ **Mã Xe gắn với Biển số** → biển số đi theo **khách hàng** (đúng
theo luật mới).\
bảng Khachhang_bien so chỉ lưu mã khách và mã biển số (chỉ vậy thôi)

\*Ma trận thẩm định

-   Tồn tại

    -   Độ tuổi lái xe -\> Ngay sinh bảng Khach

    -   Giá trị xe -\>Gia tri xe bảng Xe

    -   Khu vực hoạt động //chưa rõ là lấy dữ liệu bên bảng nào

    -   Lịch sử khách hàng // nên bỏ

    -   Lịch sử tai nạn 3 năm -\> bảng LS Xe (1 bảng thu gọn)

    -   Loại xe-\>Loai xe bảng Xe

    -   Mục đích sử dụng -\> bảng Xe

    -   Năm sản xuất -\> bảng Xe

    -   Tần suất bảo dưỡng -\> bảng Xe

    -   Tần suất sử dụng năm -\> bảng Xe

    -   Thiết bị an toàn // chưa có (độ cần thiết trong dữ liệu và
        nghiệp vụ ko cần lắm)

    -   Tình trạng kỹ thuật// chưa có (Gắn với mã Xe suy ra nên thêm vào
        bảng xe trường này)

    -   Tan suat sua chua của bảng Xe nhưng bên tiêu chí lại là tần suất
        bảo dưỡng

\*Về việc thẩm định thì dựa trên tính điểm thông qua ma trận thẩm định.
(?)\
\
THUẬT TOÁN TÍNH ĐIỂM THẨM ĐỊNH\
Input: Thông tin xe và khách hàng (Xe, KhachHang, LS_TaiNan, \...)

Output: RiskScore, RiskLevel (CHẤP NHẬN / XEM XÉT / TỪ CHỐI)

Initialize RiskScore = 0

For each tiêu chí trong MaTrậnThẩmĐịnh:

Lấy giá trị thực tế từ hồ sơ

Tìm mức tương ứng trong bảng tiêu chí

Lấy điểm = Score của mức đó

RiskScore += Score

// Đánh giá kết quả

If RiskScore \>= 25:

RiskLevel = \"TỪ CHỐI BẢO HIỂM\"

Else if RiskScore \>= 15:

RiskLevel = \"XEM XÉT - CẦN DUYỆT THÊM\"

Else:

RiskLevel = \"CHẤP NHẬN\"

Return RiskScore, RiskLevel

\*Hồ sơ thẩm định sẽ có các trường

Khi chưa thẩm định thì sẽ chỉ có 2 trường Mã KH và Mã Xe và trường trạng
thái(chờ, từ chối, chấp nhận), ngày tháng lập, mã nhân viên.

Sau khi thẩm định chuyển trạng thái thành chấp nhận, tạo thêm hợp đồng
dựa trên hồ sơ thẩm định đã được chấp nhận. Khi đó hợp đồng sẽ có thêm
các trường như ngày lập, ngày kí, ngày hết hạn, phí hợp đồng, trạng thái
hợp đồng (chưa kí, đã kí, hủy, tái tục), các trường liên quan đến việc
thanh toán

\*Hợp đồng bảo hiểm\
gồm các gói bảo hiểm

Khi tái tục tạo hợp đồng mới (mã mới), điền mã hợp đồng cũ và trường mã
hợp đồng cũ, việc tái tục nhiều lần chưa được tính đến nên để 1 hợp đồng
có thể nhìn thấy nhiều hợp đồng đời sau của nó cùng 1 lúc và ngược lại
hay là nhìn thấy đời sau liền kề và ngược lại, Và còn trường hợp cho hợp
đồng ở giữa nữa, nếu chỉ có mã hd cũ thì chỉ có thể nhìn thấy hợp đồng
cha chứ ko thấy được hợp đồng con. (?)

\*Về việc tính phí thì theo ma trận tính phí.(?)

Thuật toán tính chi phí

Input: RiskScore, GiaTriXe, TyLePhiCoBan (ví dụ 1.5%)

Output: PhiBaoHiem

If RiskScore \> 25:

Reject: \"Không thể cấp hợp đồng\"

PhiCoBan = GiaTriXe \* TyLePhiCoBan

// Chọn hệ số dựa trên RiskScore

Multiplier = lấy hệ số phù hợp từ bảng RiskScore → Multiplier

PhiCuoi = PhiCoBan \* Multiplier

Return PhiCuoi

\*Các loại bảo hiểm cũng chưa có xác định chính thức-\> đính chính là
các gói bảo hiểm (4 gói)

\*Các object khác: Xe và khách hàng, lưu các thông tin như thường thôi,
miễn sau đủ cho việc thẩm định. Về phần nội bộ sẽ có object như nhân
viên và tài khoản, trong nhân viên sẽ để lưu về ai là người lập các
kiểu, còn tài khoản là cho việc đăng nhập (do bỏ vụ cấu hình, nên việc
phân quyền không còn nhiều tác dụng cho lắm dù vậy do usecase đã có phân
quyền nên sẽ tiếp cận theo hướng khác như việc phân quyền ai được thẩm
định duyệt hồ sơ ấy vậy) (hoặc nếu đơn giản đi thì kệ vụ phân quyền, có
thể tính đến sau khi hoàn thành các chức năng). 1 bảng riêng để lưu vụ
thanh toán phí nữa.

\* Một bảng nữa lưu lịch sử về xe

\*Hiện tại vụ định phí đang ảnh hưởng bởi các gói (cần để ý)

\*Nói chung là đấy là tất cả các object, bảng dữ liệu rồi, bạn có thể bổ
sung thêm để hoàn thiện database\
\* Tổng kết về danh sách các đối tượng:\
Dưới đây là **danh sách FULL tất cả các object (bảng)** trong database
sau khi thống nhất yêu cầu, **được đặt tên rõ ràng theo nghiệp vụ bảo
hiểm ô tô**.

# ✅ DANH SÁCH TOÀN BỘ OBJECT TRONG DATABASE

Được chia nhóm theo chức năng nghiệp vụ

## **I. NHÓM DANH MỤC (MASTER DATA)**

  ------------------------------------------------------------------------------
  **Tên bảng**      **Mục đích**
  ----------------- ------------------------------------------------------------
  **KhachHang**     Thông tin khách hàng (CMND/CCCD, ngày sinh, địa chỉ\...)

  **Xe**            Thông tin kỹ thuật xe (VIN/số khung, số máy, năm SX, loại
                    xe...) --- *không có biển số*

  **BienSoXe**      Biển số xe -- lưu theo **chủ sở hữu**, không theo xe (theo
                    luật mới)

  **KhachHangXe**   Quan hệ giữa khách hàng ↔ xe ↔ biển số theo thời gian (lịch
                    sử chuyển quyền xe)

  **NhanVien**      Thông tin nhân viên làm việc trong hệ thống

  **TaiKhoan**      Đăng nhập hệ thống (username + password hash)

  **GoiBaoHiem**    Danh sách **gói bảo hiểm** (Cơ bản / Nâng cao / Toàn diện /
                    Premium)
  ------------------------------------------------------------------------------

## **II. NHÓM NGHIỆP VỤ THẨM ĐỊNH (UNDERWRITING)**

  -----------------------------------------------------------------------
  **Tên bảng**                    **Mục đích**
  ------------------------------- ---------------------------------------
  **MaTranThamDinh** *(tên mới    Lưu **tiêu chí thẩm định và các mức
  của Decision)*                  đánh giá + điểm**

  **MaTranTinhPhi** *(bảng hệ số  Lưu hệ số phí theo gói bảo hiểm và phân
  phí)*                           khúc rủi ro

  **LS_TaiNan**                   Lịch sử tai nạn / sự cố của xe (phục vụ
                                  thẩm định)
  -----------------------------------------------------------------------

## **III. NHÓM HỒ SƠ THẨM ĐỊNH**

  -----------------------------------------------------------------------
  **Tên bảng**                     **Mục đích**
  -------------------------------- --------------------------------------
  **HoSoThamDinh**                 Hồ sơ đánh giá xe trước khi cấp hợp
                                   đồng (MaXe + MaKH + trạng thái)

  **HoSoThamDinh_ChiTiet** *(tên   Lưu điểm theo từng tiêu chí của hồ sơ
  chuẩn của DecisionScore)*        (tiêu chí nào → điểm bao nhiêu)
  -----------------------------------------------------------------------

## **IV. NHÓM HỢP ĐỒNG**

  ----------------------------------------------------------------------------
  **Tên bảng**          **Mục đích**
  --------------------- ------------------------------------------------------
  **HopDong**           Hợp đồng bảo hiểm chính được cấp từ hồ sơ thẩm định

  **HopDongRelation**   Quan hệ giữa các hợp đồng (TAI_TUC hoặc CHUYEN_QUYEN)
  ----------------------------------------------------------------------------

## **V. NHÓM THANH TOÁN**

  ----------------------------------------------------------------------------
  **Tên bảng**           **Mục đích**
  ---------------------- -----------------------------------------------------
  **ThanhToanHopDong**   Lưu giao dịch thanh toán (đợt thanh toán, trạng thái
                         thanh toán\...)

  ----------------------------------------------------------------------------

# 🎯 TOÀN BỘ OBJECT NHƯ SƠ ĐỒ

KhachHang 1\-\--n BienSoXe

KhachHang 1\-\--n KhachHangXe n\-\--1 Xe

Xe 1\-\--n LS_TaiNan

HoSoThamDinh (MaKH + MaXe)

HoSoThamDinh 1\-\--n HoSoThamDinh_ChiTiet n\-\--1 MaTranThamDinh

HoSoThamDinh 1\-\--1 HopDong n\-\--1 GoiBaoHiem

HopDong 1\-\--n HopDongRelation (self relation)

HopDong 1\-\--n ThanhToanHopDong

MaTranTinhPhi liên quan GoiBaoHiem

# ✨ Tổng kết bảng theo nhóm:

  -----------------------------------------------------------------------
  **Nhóm**      **Bảng**
  ------------- ---------------------------------------------------------
  Danh mục      KhachHang, Xe, BienSoXe, KhachHangXe, NhanVien, TaiKhoan,
                GoiBaoHiem

  Thẩm định     MaTranThamDinh, MaTranTinhPhi, LS_TaiNan

  Hồ sơ thẩm    HoSoThamDinh, HoSoThamDinh_ChiTiet
  định          

  Hợp đồng      HopDong, HopDongRelation

  Thanh toán    ThanhToanHopDong
  -----------------------------------------------------------------------

Các điểm về frontend mà tôi mong muốn có được

Cấu trúc menu:Các page gồm Dashboard, Hồ sơ, Hợp đồng, Thẩm Định, Xe,
Khách, Báo cáo (sẽ cần cân nhắc)

Thêm 1 menu ở icon người dùng gồm thông tin tài khoản, đăng xuất.

Các page\
**\*Dashboard:** mong bạn quyết định giúp

  -----------------------------------------------------------------------
  **KPI**                                                   **Ý nghĩa**
  --------------------------------------------------------- -------------
  Tổng số hợp đồng ACTIVE                                   

  Doanh thu phí tháng hiện tại                              

  Số hợp đồng sắp hết hạn (T--15)                           

  Tỷ lệ tái tục (%)                                         

  Phân tích mức rủi ro hồ sơ (pie chart)                    
  -----------------------------------------------------------------------

\*Page Thông tin cá nhân: thông tin của người dùng (mong bạn quyết định
giúp nốt)

**\*Page Báo cáo:**\
a. Báo cáo quản trị nghiệp vụ

-   Danh sách hợp đồng theo trạng thái: mới phát hành, đang hiệu lực,
    sắp hết hạn, đã tái tục, đã hủy.

-   Danh sách khách hàng kèm thông tin liên quan đến hợp đồng và phương
    tiện.

-   Báo cáo doanh thu phí bảo hiểm theo thời gian (tháng, quý, năm).

-   Báo cáo tái tục: số lượng hợp đồng tái tục thành công/không thành
    công, tỷ lệ tái tục.

b\. Báo cáo hỗ trợ thẩm định

-   Thống kê hồ sơ đã thẩm định theo mức rủi ro (chấp nhận, cộng phí,
    yêu cầu bổ sung, từ chối).

-   Báo cáo tổng hợp các yếu tố rủi ro phổ biến (loại xe, độ tuổi xe,
    lịch sử tổn thất).

Lưu ý sẽ có format cho đúng chuẩn báo cáo\
\
Theo yêu cầu của bạn, tôi sẽ tách riêng \"Báo cáo Doanh thu Phí Bảo
hiểm\" và \"Báo cáo Tái tục\" khỏi Báo cáo Quản trị Nghiệp vụ, đồng thời
giữ nguyên định dạng in ấn theo mẫu bạn đã cung cấp.

**📄 1. TEMPLATE BÁO CÁO DOANH THU PHÍ BẢO HIỂM**

Đây là báo cáo tập trung vào hiệu suất tài chính và tăng trưởng doanh
thu.

\[Logo Công ty\]

\| \| CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM

\| \| Độc lập - Tự do - Hạnh phúc

\| \| \*\*\*\*\*\*\*\*\*\*, ngày \_\_\_ tháng \_\_\_ năm \_\_\_\_

**BÁO CÁO DOANH THU PHÍ BẢO HIỂM**

  ------------------------------------------------------------------------
  **Họ và tên: \[Tên người    **Chức vụ: \[Chức      **Bộ phận công tác:
  báo cáo\]**                 vụ\]**                 \[Bộ phận\]**
  --------------------------- ---------------------- ---------------------
  **Thời gian thực hiện:** Từ **Kỳ báo cáo:**        **Phạm vi:** Phí Bảo
  ngày \_\_\_ đến ngày \_\_\_ \[Tháng/Quý/Năm\]      hiểm Xe Cơ giới

  ------------------------------------------------------------------------

**NỘI DUNG CHI TIẾT (Phân tích Doanh thu)**

+-----------+-------------------+------------------------+------------+
| **Mục**   | **NỘI DUNG PHÂN   | **KẾT QUẢ/SỐ LIỆU**    | **ĐÁNH GIÁ |
|           | TÍCH**            |                        | CỦA QUẢN   |
|           |                   |                        | LÝ**       |
+===========+===================+========================+============+
| **I. Tổng | Phí bảo hiểm gốc  | **GWP trong kỳ:** \[Số |            |
| hợp Doanh | (GWP) đạt được    | tiền\]                 |            |
| thu**     | trong kỳ.         |                        |            |
|           |                   | **Lũy kế từ đầu năm:** |            |
|           |                   | \[Số tiền\]            |            |
|           |                   |                        |            |
|           |                   | **So với Kế hoạch kỳ   |            |
|           |                   | này:** \[Tỷ lệ %\]     |            |
+-----------+-------------------+------------------------+------------+
| **II.     | So sánh doanh thu | **Tăng trưởng so với   |            |
| Tăng      | kỳ này so với kỳ  | kỳ trước:** \[Tỷ lệ    |            |
| trưởng**  | trước (hoặc cùng  | %\]                    |            |
|           | kỳ năm trước).    |                        |            |
|           |                   | **Tăng trưởng so với   |            |
|           |                   | cùng kỳ năm trước:**   |            |
|           |                   | \[Tỷ lệ %\]            |            |
+-----------+-------------------+------------------------+------------+
| **III.    | Doanh thu được    | **TNDS Bắt buộc:**     |            |
| Phân bổ   | phân bổ theo các  | \[Tỷ trọng %\]         |            |
| theo Sản  | loại bảo hiểm.    |                        |            |
| phẩm**    |                   | **Vật chất xe:** \[Tỷ  |            |
|           |                   | trọng %\]              |            |
|           |                   |                        |            |
|           |                   | **TNDS Tự nguyện &     |            |
|           |                   | Khác:** \[Tỷ trọng %\] |            |
+-----------+-------------------+------------------------+------------+
| **IV.     | Doanh thu được    | **Kênh Đại lý:** \[Tỷ  |            |
| Phân tích | phân bổ theo các  | trọng %\]              |            |
| Kênh      | kênh bán hàng.    |                        |            |
| bán**     |                   | **Kênh Trực tiếp:**    |            |
|           |                   | \[Tỷ trọng %\]         |            |
|           |                   |                        |            |
|           |                   | **Kênh                 |            |
|           |                   | Bancassurance/Khác:**  |            |
|           |                   | \[Tỷ trọng %\]         |            |
+-----------+-------------------+------------------------+------------+

  --------------------------------------- -------------------------------
  **PHỤ TRÁCH BỘ PHẬN**                   **NGƯỜI BÁO CÁO**

  (Ký, ghi rõ họ tên)                     (Ký, ghi rõ họ tên)
  --------------------------------------- -------------------------------

**📄 2. TEMPLATE BÁO CÁO TÁI TỤC HỢP ĐỒNG**

Đây là báo cáo tập trung vào chất lượng danh mục khách hàng, sự duy trì
hợp đồng và tỷ lệ giữ chân khách hàng.

\[Logo Công ty\]

\| \| CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM

\| \| Độc lập - Tự do - Hạnh phúc

\| \| \*\*\*\*\*\*\*\*\*\*, ngày \_\_\_ tháng \_\_\_ năm \_\_\_\_

**BÁO CÁO TÁI TỤC HỢP ĐỒNG**

  -----------------------------------------------------------------------
  **Họ và tên: \[Tên người  **Chức vụ: \[Chức      **Bộ phận công tác:
  báo cáo\]**               vụ\]**                 \[Bộ phận\]**
  ------------------------- ---------------------- ----------------------
  **Thời gian thực hiện:**  **Kỳ báo cáo:**        **Phạm vi:** Hợp đồng
  Từ ngày \_\_\_ đến ngày   \[Tháng/Quý/Năm\]      Bảo hiểm Xe Cơ giới
  \_\_\_                                           

  -----------------------------------------------------------------------

**NỘI DUNG CHI TIẾT (Phân tích Tái tục)**

+-----------+---------------------+--------------------+-------------+
| **Mục**   | **NỘI DUNG PHÂN     | **KẾT QUẢ/SỐ       | **ĐÁNH GIÁ  |
|           | TÍCH**              | LIỆU**             | CỦA QUẢN    |
|           |                     |                    | LÝ**        |
+===========+=====================+====================+=============+
| **I. Tổng | Tổng số Hợp đồng    | **Tổng HĐ đến      |             |
| quan**    | đến hạn tái tục     | hạn:** \[Số        |             |
|           | trong kỳ.           | lượng\]            |             |
|           |                     |                    |             |
|           |                     | **Phí dự kiến tái  |             |
|           |                     | tục:** \[Số tiền\] |             |
+-----------+---------------------+--------------------+-------------+
| **II.     | Kết quả tái tục     | **HĐ Tái tục THÀNH |             |
| Hiệu suất | thành công và không | CÔNG:** \[Số       |             |
| Tái tục** | thành công.         | lượng\]            |             |
|           |                     |                    |             |
|           |                     | **Phí đạt được từ  |             |
|           |                     | tái tục:** \[Số    |             |
|           |                     | tiền\]             |             |
|           |                     |                    |             |
|           |                     | **TỶ LỆ TÁI TỤC:** |             |
|           |                     | \[Tỷ lệ %\]        |             |
+-----------+---------------------+--------------------+-------------+
| **III. Lý | Phân loại các lý do | \- **Chuyển sang   |             |
| do không  | chính dẫn đến việc  | đối thủ:** \[Số    |             |
| Tái tục** | khách hàng không    | lượng/Tỷ lệ %\]    |             |
|           | tái tục.            |                    |             |
|           |                     | \- **Không có nhu  |             |
|           |                     | cầu (Bán xe,       |             |
|           |                     | v.v.):** \[Số      |             |
|           |                     | lượng/Tỷ lệ %\]    |             |
|           |                     |                    |             |
|           |                     | \- **Do phí        |             |
|           |                     | cao/Rủi ro cao:**  |             |
|           |                     | \[Số lượng/Tỷ lệ   |             |
|           |                     | %\]                |             |
+-----------+---------------------+--------------------+-------------+
| **IV.     | Đánh giá hiệu quả   | **Số lượng HĐ được |             |
| Chính     | của chính sách ưu   | NCD:** \[Số        |             |
| sách Ưu   | đãi tái tục (nếu    | lượng\]            |             |
| đãi**     | có).                |                    |             |
|           |                     | **Tổng mức giảm    |             |
|           |                     | phí:** \[Số        |             |
|           |                     | tiền/Tỷ lệ %\]     |             |
+-----------+---------------------+--------------------+-------------+

  --------------------------------------- -------------------------------
  **PHỤ TRÁCH BỘ PHẬN**                   **NGƯỜI BÁO CÁO**

  (Ký, ghi rõ họ tên)                     (Ký, ghi rõ họ tên)
  --------------------------------------- -------------------------------

Với yêu cầu các báo cáo quản trị và thẩm định phải được **in ra** và
tuân thủ định dạng của mẫu **Báo cáo kết quả công việc** (có Quốc hiệu,
Tiêu ngữ, và phần ký), tôi sẽ tái cấu trúc lại các template để phù hợp
với định dạng đó, đồng thời vẫn đảm bảo tính chất **phân tích dữ liệu**
của từng loại báo cáo.

Trong định dạng in, phần **NỘI DUNG CHI TIẾT** sẽ được thay thế bằng các
bảng phân tích dữ liệu cụ thể.

**📄 TEMPLATE BÁO CÁO HỖ TRỢ THẨM ĐỊNH (Định dạng In)**

\[Logo Công ty\]

\| \| CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM

\| \| Độc lập - Tự do - Hạnh phúc

\| \| \*\*\*\*\*\*\*\*\*\*, ngày \_\_\_ tháng \_\_\_ năm \_\_\_\_

**BÁO CÁO HỖ TRỢ THẨM ĐỊNH**

  -----------------------------------------------------------------------
  **Họ và tên: \[Tên người **Chức vụ: \[Chức     **Bộ phận công tác: \[Bộ
  báo cáo\]**              vụ\]**                phận\]**
  ------------------------ --------------------- ------------------------
  **Thời gian thực hiện:** **Kỳ báo cáo:**       **Phạm vi:** Hồ sơ yêu
  Từ ngày \_\_\_ đến ngày  \[Tháng/Quý/Năm\]     cầu bảo hiểm mới và tái
  \_\_\_                                         tục

  -----------------------------------------------------------------------

**NỘI DUNG CHI TIẾT (Phân tích Rủi ro)**

+-----------------+-------------------+------------------+------------+
| **Mục**         | **NỘI DUNG THỐNG  | **KẾT QUẢ/SỐ     | **ĐÁNH GIÁ |
|                 | KÊ/PHÂN TÍCH**    | LIỆU**           | CỦA QUẢN   |
|                 |                   |                  | LÝ**       |
+=================+===================+==================+============+
| **I. Kết quả    | Thống kê Hồ sơ đã | **Tổng Hồ sơ đã  |            |
| Thẩm định**     | thẩm định theo    | xử lý:** \[Số    |            |
|                 | Quyết định cuối   | lượng\]          |            |
|                 | cùng.             |                  |            |
|                 |                   | \- Chấp nhận     |            |
|                 |                   | (Chuẩn): \[Tỷ lệ |            |
|                 |                   | %\]              |            |
|                 |                   |                  |            |
|                 |                   | \- Chấp nhận     |            |
|                 |                   | (Cộng phí): \[Tỷ |            |
|                 |                   | lệ %\]           |            |
|                 |                   |                  |            |
|                 |                   | \- Từ chối bảo   |            |
|                 |                   | hiểm: \[Tỷ lệ    |            |
|                 |                   | %\]              |            |
+-----------------+-------------------+------------------+------------+
| **II. Yếu tố    | Báo cáo tổng hợp  | **Top 3 rủi ro   |            |
| Rủi ro Phổ      | các yếu tố thúc   | chính:**         |            |
| biến**          | đẩy rủi ro.       |                  |            |
|                 |                   | 1\. \[Loại xe/Độ |            |
|                 |                   | tuổi\] - \[Tỷ lệ |            |
|                 |                   | hồ sơ bị ảnh     |            |
|                 |                   | hưởng\]          |            |
|                 |                   |                  |            |
|                 |                   | 2\. \[Lịch sử    |            |
|                 |                   | tổn thất\] -     |            |
|                 |                   | \[Tỷ lệ cộng phí |            |
|                 |                   | TB\]             |            |
|                 |                   |                  |            |
|                 |                   | 3\. \[Yếu tố     |            |
|                 |                   | khác\] - \[Mô tả |            |
|                 |                   | chi tiết\]       |            |
+-----------------+-------------------+------------------+------------+
| **III. Phân     | Thống kê số lượng | **Số lượng Hồ sơ |            |
| tích Cộng phí** | Hồ sơ bị áp dụng  | bị Cộng phí:**   |            |
|                 | phí tăng thêm.    | \[Số lượng\]     |            |
|                 |                   |                  |            |
|                 |                   | **Mức cộng phí   |            |
|                 |                   | Trung bình:**    |            |
|                 |                   | \[Tỷ lệ %\]      |            |
|                 |                   |                  |            |
|                 |                   | **Lý do cộng phí |            |
|                 |                   | chính:** \[VD:   |            |
|                 |                   | Lịch sử bồi      |            |
|                 |                   | thường cao\]     |            |
+-----------------+-------------------+------------------+------------+
| **IV. Kiến nghị | Đề xuất điều      | \[Đề xuất điều   |            |
| (               | chỉnh chính       | chỉnh biểu       |            |
| Underwriting)** | sách/biểu phí.    | phí/quy tắc thẩm |            |
|                 |                   | định\]           |            |
+-----------------+-------------------+------------------+------------+

  --------------------------------------- -------------------------------
  **PHỤ TRÁCH BỘ PHẬN**                   **NGƯỜI BÁO CÁO**

  (Ký, ghi rõ họ tên)                     (Ký, ghi rõ họ tên)
  --------------------------------------- -------------------------------

Chắc chắn rồi! Dưới đây là chú thích chi tiết về vị trí (bố cục) của
từng thành phần trong mẫu báo cáo in ấn, ngoại trừ phần Nội dung chi
tiết (vì phần này nằm ở trung tâm báo cáo).

Các thành phần được bố trí theo tiêu chuẩn văn bản hành chính và nghiệp
vụ:

## 🏷️ CHÚ THÍCH VỊ TRÍ CÁC PHẦN TRÊN BÁO CÁO IN

+----+-------------+-------------------+------------------------------+
| *  | **Thành     | **Vị Trí (Bố      | **Chú Thích Mục Đích**       |
| *S | Phần**      | cục)**            |                              |
| TT |             |                   |                              |
| ** |             |                   |                              |
+====+=============+===================+==============================+
| *  | **Logo Công | **Góc trên cùng   | Định danh thương hiệu/tổ     |
| *I | ty**        | bên Trái**        | chức phát hành báo cáo.      |
| ** |             |                   | Thường căn lề trái.          |
+----+-------------+-------------------+------------------------------+
| ** | **Quốc hiệu | **Góc trên cùng   | Căn cứ pháp lý và tính chính |
| II | và Tiêu     | bên Phải**        | thức của văn bản. Thường căn |
| ** | ngữ**       |                   | giữa hoặc căn phải trong     |
|    |             |                   | phạm vi góc phải.            |
+----+-------------+-------------------+------------------------------+
| *  | **Địa điểm  | **Dưới Quốc hiệu, | Xác định nơi và thời điểm    |
| *I | và Thời     | căn Lề Phải**     | ban hành báo cáo (ví dụ: *Hà |
| II | gian**      |                   | Nội, ngày 10 tháng 11 năm    |
| ** |             |                   | 2025*).                      |
+----+-------------+-------------------+------------------------------+
| ** | **Tiêu đề   | **Giữa trang, Nổi | Xác định rõ loại báo cáo.    |
| IV | Báo cáo**   | bật (In hoa,      | Được căn giữa trang, nằm     |
| ** |             | Đậm)**            | dưới cùng của phần hành      |
|    |             |                   | chính.                       |
+----+-------------+-------------------+------------------------------+
| *  | **Thông tin | **Dưới Tiêu đề,   | Cung cấp thông tin định danh |
| *V | Người/Bộ    | nằm ngang trang   | người chịu trách nhiệm và    |
| ** | phận Báo    | (Thường dùng      | phạm vi báo cáo. Phần này    |
|    | cáo**       | Bảng/Khung)**     | đảm bảo tính chịu trách      |
|    |             |                   | nhiệm cá nhân.               |
+----+-------------+-------------------+------------------------------+
| ** | **Phần Chữ  | **Cuối trang,     | Xác nhận tính xác thực và    |
| VI | ký/Xác      | chia hai Cột/Vị   | phê duyệt nội dung báo cáo.  |
| ** | nhận**      | trí**             |                              |
|    |             |                   | \- **Người báo cáo:** Phía   |
|    |             |                   | phải (người lập).            |
|    |             |                   |                              |
|    |             |                   | \- **Phụ trách/Quản lý:**    |
|    |             |                   | Phía trái (người duyệt).     |
+----+-------------+-------------------+------------------------------+

**Tóm tắt bố cục chung:**

1.  **Phần Đầu (Header/Hành chính):** Luôn chia thành hai cột
    (Logo/Thông tin người báo cáo bên trái; Quốc hiệu/Ngày tháng bên
    phải) và Tiêu đề căn giữa.

2.  **Phần Giữa (Body/Nội dung):** Chiếm phần lớn diện tích, sử dụng
    bảng biểu để trình bày dữ liệu chi tiết.

3.  **Phần Cuối (Footer/Xác nhận):** Chia làm hai cột, căn đều sang hai
    bên dưới cùng để lấy chữ ký xác nhận.

\*Page Hồ sơ:\
gồm chức năng quản lý hồ sơ thẩm định (thêm, sửa, xóa, xem)//\
//mô tả giao diện mong muốn: gồm tên page, 1 bảng danh sách các hồ sơ,
các nút chức năng như thêm sửa xóa ở góc trên bên phải, bên ngoài của
bảng. Nút xem thì ở cuối mỗi dòng trong bảng. Bảng có thang cuộn để đi
lại

-Pop up xem chi tiết thông tin của 1 hồ sơ cụ thể.

-Sửa xóa cũng cần chọn 1 hồ sơ trước khi ấn vào nút sửa xóa

-Thêm mới là pop up Thêm mới hồ sơ thẩm định\
\*Về pop up thêm mới hồ sơ thẩm định có liên kết với 2 pop up của 2 page
khác là Pop up thêm mới Khách và pop up thêm mới Xe, lí do là ở phần
nhập nội dung sẽ có 2 trường khách và xe là 2 dropdown list tham chiếu
đến 2 dữ liệu của 2 bảng Khách và Xe, dữ liệu hiện lên trên trường tham
chiếu sẽ là tên khách và biển số xe. Về hành vi của 2 pop up thêm mới
Khách và pop up thêm mới xe thì sau nhập xong và ấn lưu thì sẽ hiện dữ
liệu cần tham chiếu theo cái vừa nhập và trong 2 trường của Pop up thêm
mới hồ sơ thẩm định. Về 2 trường khách và xe trong Pop up thêm mới hồ sơ
thẩm định, trường xe sẽ lọc theo trường khách nếu trường khách đã được
điền.\
\
Sau khi thêm mới thành công rồi thì hồ sơ sẽ ngay lập tức được đưa vào
thẩm định tự động dựa trên ma trận.\
Trạng thái của hồ sơ lúc này sẽ là chờ (chỉ chuyển trạng thái khi đã
được quyết định lập hợp đồng)

\*Page Thẩm định: Hiển thị bảng danh sách các hồ sơ đã được thẩm định
cũng như kết quả Thẩm định. Có button xem chi tiết để mở pop up để thấy
kết quả đánh giá dựa trên từng tiêu chí (vụ button có thể xem xét xem có
cần thiết hay không).\
thêm cả việc tính phí vào và việc duyệt nên thay luôn bằng nút tạo hợp
đồng còn không duyệt thì nút từ chối. Ấn tạo hợp đồng xong thì ra form
tạo hợp đồng như bạn nói :ở đó làm các việc (khi đó một số thông tin hợp
đồng được tự động insert như thông tin khách, thông tin xe, thời gian,
còn thông tin nhân viên thì có thể lấy tự động)

\- Chọn gói bảo hiểm

\- Hiển thị phí dự kiến

\- Xác nhận tạo hợp đồng

\*Page Khách và Page Xe: cấu trúc sẽ cũng khá giống nhau: gồm tên page,
1 bảng dữ liệu, các nút chức năng như thêm sửa xóa ở góc trên bên phải,
bên ngoài của bảng. Nút xem thì ở cuối mỗi dòng trong bảng. Bảng có
thang cuộn để đi lại

-Pop up thêm mới: trong đó pop up thêm mới xe có trường khách hàng là
dropdown list, tham chiếu đến dữ liệu Khách. Cũng như ở dropdown list
này cũng có nút để mở pop up thêm mới khách hàng.

-Về các trường thông tin khác mà cần thiết cho 2 pop up thì dựa trên cơ
sở dữ liệu.

-đặc biệt 1 chút về pop up thêm mới Xe: có 1 bảng nhập liệu để nhập dữ
liệu cho Lịch sử xe

\- về chức năng xem và sửa:

+đối với Page khách: sẽ là 2 views, có nút để chọn: Thông tin cá nhân và
Hợp đồng. Ở view Thông tin cá nhân sẽ có thông tin về khách hàng (trình
bày theo các dòng nhưng không phải bảng)và thông tin về biển số mà khác
sở hữu (trình bày theo kiểu danh sách) và thông tin về xe của khách (
trình bày theo bảng ngắn gọn có nút xem chi tiết) nếu ấn xem chi tiết sẽ
dẫn sang view Thông tin xe. Ở view hợp đồng sẽ hiện danh sách tất cả các
hợp đồng của khách ( trình bày theo bảng ngắn gọn có nút xem chi tiết)

+đối với Page xe: sẽ là 1 view: Thông tin xe. Ở view Thông tin xe sẽ có
thông tin về xe , chủ xe (trình bày theo các dòng nhưng không phải bảng)
và thông tin về lịch sử của xe đó( trình bày theo bảng)

+Chung cả 2 thì nút sửa ở cuối view thông tin ấn vào sẽ mở ra pop up để
sửa các trường thuộc Thông tin cá nhân của khách (không bao gồm thông
tin hợp đồng) và Thông tin xe của khách (bao gồm cả lịch sử)

\*Page Hợp đồng

Gồm 3 page nhỏ hơn:\
-Quản lý hợp đồng: như các page bên trên sẽ (nút chức năng, bảng dữ
liệu-dự liệu hiện ra tham khảo sql (cần có trường trạng thái hợp đồng),
ngoài ra có thêm thẻ hiện số hợp đồng đang có hiệu lực, cần duyệt và sắp
đến hạn ( theo logic thì chắc là khoảng 15 ngày trước khi hết hạn chăng,
bạn có thể quyết định giúp nếu cần )\
-Quản lý phát hành :hiện danh sách các hợp đồng mới được tạo thành (chưa
ký). Có thể xem chi tiết thông tin của hợp đồng và có thêm chức năng in
(in ra hợp đồng theo chuẩn template) và thanh toán (thủ công đổi trạng
thái thanh toán, có chức năng in hóa đơn)

form template chuẩn của hợp đồng:\
Dưới đây là **template chuẩn của một HỢP ĐỒNG BẢO HIỂM Ô TÔ** (bản rút
gọn nhưng đầy đủ các thành phần cần thiết để bạn đưa vào hệ thống và
xuất file PDF).

✅ Áp dụng cho PJICO / Bảo Việt / PVI --- theo chuẩn hồ sơ hợp đồng bảo
hiểm xe cơ giới.\
✅ Dễ convert sang **Word / PDF** và lưu record vào DB.

# 📄 HỢP ĐỒNG BẢO HIỂM XE Ô TÔ (TEMPLATE)

(Mẫu ký giữa Công ty bảo hiểm và khách hàng)

## 🟦 **I. THÔNG TIN HỢP ĐỒNG**

  -----------------------------------------------------------------------
  **Thông tin**        **Nội dung**
  -------------------- --------------------------------------------------
  **Số hợp đồng**      HD-YYYYMMDD-XXXX

  **Ngày phát hành hợp ..............
  đồng**               

  **Ngày hiệu lực**    ..............

  **Ngày kết thúc**    ..............

  **Tình trạng hợp     DRAFT / ACTIVE / CANCELLED / TERMINATED / EXPIRED
  đồng**               / RENEWED

  **Loại gói bảo       Cơ bản / Mở rộng / Toàn diện / Cao cấp
  hiểm**               
  -----------------------------------------------------------------------

## 🟦 **II. THÔNG TIN KHÁCH HÀNG (BÊN MUA BẢO HIỂM)**

  -----------------------------------------------------------------------
  **Trường**                                      **Nội dung**
  ----------------------------------------------- -----------------------
  **Họ và tên**                                   ..............

  **Số CCCD / Hộ chiếu**                          ..............

  **Ngày sinh**                                   ..............

  **Địa chỉ liên hệ**                             ..............

  **Số điện thoại**                               ..............

  **Email**                                       ..............
  -----------------------------------------------------------------------

## 🟦 **III. THÔNG TIN XE ĐƯỢC BẢO HIỂM**

  -----------------------------------------------------------------------
  **Trường**                       **Nội dung**
  -------------------------------- --------------------------------------
  **Biển số xe**                   ..............

  **Số khung**                     ..............

  **Số máy**                       ..............

  **Hãng xe / Model**              ..............

  **Năm sản xuất**                 ..............

  **Giá trị xe (giá thị trường /   .............. VNĐ
  định giá)**                      

  **Mục đích sử dụng**             Cá nhân / Kinh doanh vận tải / Taxi /
                                   Khác

  **Tình trạng kỹ thuật**          Tốt / Trung bình / Kém

  **Thiết bị an toàn**             ABS / Airbag / ESP / Camera\...
  -----------------------------------------------------------------------

## 🟦 **IV. DANH MỤC QUYỀN LỢI VÀ PHẠM VI BẢO HIỂM**

  -----------------------------------------------------------------------
  **Quyền lợi bảo hiểm**    **Số tiền bảo hiểm tối đa**
  ------------------------- ---------------------------------------------
  Thiệt hại vật chất xe     .............. VNĐ

  Bảo hiểm người ngồi trên  .............. VNĐ/người/vụ
  xe                        

  Trách nhiệm dân sự bên    .............. VNĐ/vụ
  thứ ba                    

  Mở rộng (nếu có)          Ngập nước / Mất cắp bộ phận / Thay thế chính
                            hãng / ...
  -----------------------------------------------------------------------

Ghi chú: Phạm vi bảo hiểm tùy theo **GÓI** mà khách hàng lựa chọn.

## 🟦 **V. PHÍ BẢO HIỂM**

  -----------------------------------------------------------------------
  **Thành phần phí**                       **Giá trị**
  ---------------------------------------- ------------------------------
  Phí bảo hiểm cơ bản (tỷ lệ % theo giá    .............. VNĐ
  trị xe)                                  

  Hệ số điều chỉnh theo điểm rủi ro        x ........... (%)

  **Tổng phí phải thanh toán**             **.............. VNĐ**

  Phương thức thanh toán                   Chuyển khoản / Tiền mặt / POS

  Trạng thái thanh toán                    Đã thanh toán / Chưa thanh
                                           toán
  -----------------------------------------------------------------------

## 🟦 **VI. KẾT QUẢ THẨM ĐỊNH (RISK ASSESSMENT)**

  -----------------------------------------------------------------------
  **Tiêu chí thẩm định**                 **Giá trị**  **Điểm**
  -------------------------------------- ------------ -------------------
  Giá trị xe                             ..........   +3 / -2 / ...

  Loại xe                                ..........   +2

  Mục đích sử dụng                       ..........   +4

  Năm sản xuất                           ..........   -1

  Lịch sử tai nạn 3 năm                  ..........   +3

  Tần suất sử dụng                       ..........   +2
  -----------------------------------------------------------------------

\| **TOTAL RISK SCORE** \| **........... điểm** \|\
\| **Risk Level** \| CHẤP NHẬN / XEM XÉT / TỪ CHỐI \|

## 🟦 VII. ĐIỀU KHOẢN LOẠI TRỪ (EXCLUSIONS)

Các trường hợp không thuộc phạm vi bảo hiểm, ví dụ:

-   Xe sử dụng sai mục đích khai báo

-   Lái xe không có bằng lái hợp lệ

-   Say rượu / chất kích thích

-   Chiến tranh, thiên tai đặc biệt\...

*(Danh sách đầy đủ xem phụ lục hợp đồng hoặc quy tắc bảo hiểm).*

## 🟦 VIII. CHẤM DỨT / TÁI TỤC / CHUYỂN QUYỀN

  -----------------------------------------------------------------------
  **Hành động**           **Mô tả**
  ----------------------- -----------------------------------------------
  **Tái tục hợp đồng**    Sinh hợp đồng mới, liên kết với hợp đồng trước
                          đó.

  **Chấm dứt**            Khi xe bán / tai nạn toàn bộ / thỏa thuận 2
                          bên.

  **Chuyển quyền sở hữu   Cập nhật chủ xe và ghi nhận vào
  xe**                    HopDongRelation.
  -----------------------------------------------------------------------

## 🟦 IX. CHỮ KÝ XÁC NHẬN

### ✅ BÊN MUA BẢO HIỂM

(Ký, ghi rõ họ tên)

.......................................

### ✅ DOANH NGHIỆP BẢO HIỂM

(Ký, đóng dấu)

.......................................

### 📌 Ghi chú kỹ thuật cho backend / DB

Bạn nên lưu **template dạng JSON** trong DB để render ra PDF:

{

\"MaHD\": \"HD20251110-001\",

\"NgayHieuLuc\": \"2025-11-10\",

\"TrangThai\": \"ACTIVE\",

\"PhiBaoHiem\": 15000000

}

Nếu bạn muốn, mình có thể tiếp tục:

✅ tạo phiên bản Word/PDF tự động xuất từ backend (Node.js +
pdfkit/mammoth)\
✅ mapping template thành data-binding để sinh file từ DB\
✅ generate REST API /api/hopdong/:id/download

Chỉ cần nói: **\"Xuất file Word/PDF từ template\"** hoặc **\"Sinh API
download hợp đồng\"**.

tham khảo bảng trạng thái

  --------------------------------------------------------------------------
  **Mã trạng thái**     **Tên trạng  **Ý nghĩa**
                        thái**       
  --------------------- ------------ ---------------------------------------
  **DRAFT**             Khởi tạo /   Hợp đồng được tạo từ hồ sơ thẩm định đã
                        Chưa phát    chấp nhận nhưng chưa ký / chưa thanh
                        hành         toán (chỉ lưu tạm).

  **PENDING_PAYMENT**   Chờ thanh    Khách hàng phải đóng phí trước khi hợp
                        toán         đồng có hiệu lực.

  **ACTIVE**            Có hiệu lực  Đã ký + đã thanh toán phí.

  **EXPIRED**           Hết hạn      Đến ngày hết hạn mà không tái tục.

  **CANCELLED**         Hủy          Hủy trước hiệu lực hoặc theo yêu cầu
                                     của khách hàng/công ty.

  **TERMINATED**        Thanh lý /   Hợp đồng dừng trước ngày hết hạn (tai
                        chấm dứt     nạn toàn bộ, chuyển quyền sở hữu\...).
                        trước hạn    

  **RENEWED**           Đã tái tục   Để đánh dấu hợp đồng được kế thừa từ
                                     hợp đồng khác (có bản ghi trong
                                     HopDongRelation).
  --------------------------------------------------------------------------

-Quản lý tái tục hợp đồng : hiện danh sách hợp đồng tất cả các hợp đồng
đang có hiệu lực, hết hạn.\
có thể chọn 1 hợp đồng cụ thể để thực hiện các thao tác như xem, tái tục
(tạo mới hợp đồng kế tiếp-\> lúc đó sẽ quay về Quản lý phát hành),
chuyển nhượng thì vì bảo hiểm gắn với **rủi ro của chủ mới**, nên **bắt
buộc thẩm định lại**. (các bước sau đó theo quy trình thông thường,
nghĩa dù làm gì đi nữa cũng sẽ là 1 hợp đồng mới) còn về việc hủy trước
hạn (có nút hủy, sau đó sang trang thanh toán để thực hiện hoàn phí)\
\
\*\*\*\*nguyên lí về việc hoàn phí (dành cho cả front, back, database)\
Rất đúng --- **việc thanh toán đủ hay chưa**, hoặc **hoàn tiền đã hết
hay chưa**, là logic nghiệp vụ quan trọng.\
Bạn đã có bảng ThanhToanHopDong, vậy bây giờ trả lời rõ:

**Làm sao biết hợp đồng đã được thanh toán đủ hoặc hoàn tiền xong
chưa?**

# ✅ Nguyên Tắc Cốt Lõi

### ✔️ Mọi giao dịch (thu phí / hoàn phí) = một dòng trong ThanhToanHopDong

Và dựa trên đó:

**Tổng thanh toán ròng = Tổng tiền đã thu − Tổng tiền hoàn lại**

Trong bảng:

-   LoaiGiaoDich = \'THANH_TOAN\' → số tiền **dương**

-   LoaiGiaoDich = \'HOAN_PHI\' → số tiền **âm**

Không cần thêm trường riêng, chỉ tính tổng SoTien.

# ✅ Công thức dùng trong backend

SELECT SUM(SoTien)

FROM ThanhToanHopDong

WHERE MaHD = \@MaHD

AND TrangThai = \'THANH_CONG\';

→ Giá trị trả về = **Tổng tiền khách đã thanh toán thực tế** (đã trừ
tiền hoàn nếu có)

## ✅ Quy tắc xác định trạng thái

### **1. ĐÃ THANH TOÁN ĐỦ**

IF TotalPaid \>= HopDong.PhiBaoHiem

→ ĐẶT trạng thái hợp đồng = \'DA_THANH_TOAN\'

### **2. THANH TOÁN THIẾU**

IF TotalPaid \> 0 AND TotalPaid \< HopDong.PhiBaoHiem

→ ĐẶT trạng thái = \'THANH_TOAN_MOT_PHAN\'

### **3. CHƯA THANH TOÁN**

IF TotalPaid = 0

→ ĐẶT trạng thái = \'CHUA_THANH_TOAN\'

## ✅ Hoàn tiền (refund)

Khi hủy hợp đồng trước hạn, hệ thống thực hiện:

INSERT INTO ThanhToanHopDong (MaHD, SoTien, LoaiGiaoDich)

VALUES (MaHD, -RefundAmount, \'HOAN_PHI\');

### **Xác định hoàn tiền đầy đủ chưa**

Nếu tổng tiền thanh toán ròng = 0:

IF TotalPaid = 0

→ ĐÃ HOÀN PHÍ XONG

## 🔥 Ví dụ minh hoạ

  -----------------------------------------------------------------------
  **Loại giao dịch**                         **Số tiền**
  ------------------------------------------ ----------------------------
  Thanh toán lần 1                           +5.000.000

  Hoàn phí khi hủy                           −2.000.000
  -----------------------------------------------------------------------

Tổng thanh toán ròng = **3.000.000**

→ Nếu PhiBaoHiem = 5.000.000 → **còn thiếu 2.000.000**

→ Nếu hợp đồng đã bị hủy → **còn hoàn thêm 3.000.000 nữa**

## 🧠 Backend triển khai như thế nào (pseudo code)

const totalPaid = await db.query(\`

SELECT SUM(SoTien) as TotalPaid

FROM ThanhToanHopDong

WHERE MaHD = \@MaHD

AND TrangThai = \'THANH_CONG\'

\`);

if (totalPaid \>= PhiBaoHiem)

status = \"DA_THANH_TOAN\";

else if (totalPaid \> 0)

status = \"THANH_TOAN_MOT_PHAN\";

else

status = \"CHUA_THANH_TOAN\";

→ Không cần lưu trạng thái trong bảng thanh toán\
→ Chỉ cập nhật **trạng thái hợp đồng** dựa trên tính toán.

# ✅ Kết luận

  -----------------------------------------------------------------------
  **Mục tiêu**                     **Giải pháp**
  -------------------------------- --------------------------------------
  Biết hợp đồng đã thanh toán đủ   SUM(SoTien) (giao dịch dương) \>=
  chưa                             PhiBaoHiem

  Biết đã hoàn tiền đủ chưa        SUM(SoTien) (bao gồm âm) = 0

  Hỗ trợ nhiều lần thanh toán /    Mỗi giao dịch là 1 dòng riêng trong
  hoàn tiền                        bảng
  -----------------------------------------------------------------------

Nếu bạn muốn, mình có thể:

-   Auto-update trạng thái hợp đồng sau mỗi thanh toán (trigger SQL hoặc
    logic trong controller)

-   Viết API /hopdong/:id/thanh-toan

-   Viết API /hopdong/:id/hoan-tien

👉 Reply: **\"Làm luôn API thanh toán và hoàn tiền\"** nếu bạn muốn mình
code tiếp.

Về cách hoạt động: Đây là luồng chuẩn cho kịch bản \"hiển thị mã trước,
không cho sửa\":

**Khi người dùng bấm nút \"Thêm Khách Hàng Mới\":**

1.  **Frontend (React/Vue/\...) gọi:** Frontend *không* hiển thị form
    ngay. Thay vào đó, nó gọi một API endpoint mới mà bạn sẽ phải tạo,
    ví dụ: GET /api/khachhang/ma-moi.

2.  **Backend (API) nhận:** Backend nhận được yêu cầu GET này, nó liền
    kết nối vào database và chạy **chỉ một** câu SQL:

> SQL
>
> SELECT
>
> \'KH\' + RIGHT(\'0000\' + CAST(NEXT VALUE FOR seq_MaKH AS
> VARCHAR(10)), 4) AS NewMaKH;

3.  **Database trả về:** Database lấy số tiếp theo từ seq_MaKH (ví dụ:
    số 26), định dạng nó, và trả về một chuỗi duy nhất: KH0026. *(Lưu ý:
    Ngay tại thời điểm này, số 26 đã bị \"tiêu thụ\" khỏi sequence. Đây
    là điều bình thường).*

4.  **Backend trả về:** Backend trả JSON { \"newMaKH\": \"KH0026\" } cho
    Frontend.

5.  **Frontend nhận:** Frontend nhận được mã KH0026. *Bây giờ* nó mới
    hiển thị form tạo khách hàng, và đặt giá trị của ô MaKH là KH0026 và
    khóa ô đó lại (thuộc tính disabled hoặc readonly).

**Khi người dùng điền xong thông tin và bấm \"Lưu\":**

6.  **Frontend gửi:** Frontend POST toàn bộ dữ liệu (bao gồm cả mã
    KH0026 đã bị khóa) lên API:

> JSON
>
> {
>
> \"MaKH\": \"KH0026\",
>
> \"HoTen\": \"Nguyễn Văn B\",
>
> \"SDT\": \"0987\...\"
>
> }

7.  **Backend và Database:** Backend chạy lệnh INSERT với đầy đủ dữ
    liệu. Trigger trg_AutoMaKH của bạn kích hoạt. Nó thấy i.MaKH là
    KH0026 (không phải NULL), nên nó chạy nhánh logic số 2 và chèn
    KH0026 vào bảng.
