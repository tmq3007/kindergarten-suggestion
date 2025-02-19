# Sử dụng image openjdk:17-jdk-alpine làm base image.
# Image này chứa Java Development Kit (JDK) phiên bản 17 trên hệ điều hành Alpine Linux.
FROM openjdk:17-jdk-alpine

# Thiết lập thư mục làm việc trong container là /app.
# Tất cả các lệnh sau sẽ được thực thi trong thư mục này.
WORKDIR /app

# Sao chép file JAR của ứng dụng Spring Boot từ thư mục target (trên máy tính của bạn) vào container,
# và đổi tên thành app.jar.
COPY target/*.jar app.jar

# Mở cổng 8080 để ứng dụng Spring Boot có thể lắng nghe các kết nối từ bên ngoài.
EXPOSE 8080

# Chỉ định lệnh để chạy ứng dụng Spring Boot khi container khởi động.
ENTRYPOINT ["java","-jar","app.jar"]