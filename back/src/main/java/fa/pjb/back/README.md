Thư mục:

- config: Cấu hình chung cho ứng dụng (Spring Security, Swagger,...)

- controller: REST API endpoints
  - Nhận DTO từ Client >>> Service
  - Nhận VO từ Service >>(bọc trong ApiResponse)>> Client
  
- service: Xử lý logic nghiệp vụ
  - DTO -> Entity (mapper)
  - Lưu Entity vào database
  - Entity -> VO (mapper)
  
- repository: Giao tiếp với database

- entity: Các lớp ánh xạ với table trong database (JPA Entity)

- dto: Truyền dữ liệu từ tầng giao diện >>> service

- vo: Truyền dữ liệu cho client

- exception: Xử lý ngoại lệ (Custom Exception, Global Handler)

- response: Chuẩn hóa phản hồi API

- mapper: Chuyển đổi dữ liệu giữa các lớp 