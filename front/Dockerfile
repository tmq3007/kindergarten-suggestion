# Giai đoạn 1 - Build
# Base image
# Sử dụng Node.js với phiên bản Alpine Linux và đặt tên cho giai đoạn này là builder
FROM node:18-alpine AS builder

# Tạo thư mục làm việc /app bên trong container
WORKDIR /app
# Tất cả các lệnh sau sẽ chạy bên trong /app

# Copy package.json và lock file vào cache để tối ưu cài đặt package
COPY package.json package-lock.json ./
# Đảm bảo cài đặt đúng phiên bản dependencies mà không làm thay đổi lock file
RUN npm install --frozen-lockfile
# Copy toàn bộ code vào container
COPY . .
# Build Next.js app >>> mã nguồn đã build được lưu trong thư mục .next/
RUN npm run build

# Giai đoạn 2 - Production
FROM node:18-alpine

# Tạo thư mục làm việc /app bên trong container
WORKDIR /app

# Copy files từ build stage
# File chưa mã nguồn đã build
COPY --from=builder /app/.next .next
# File hình ảnh, favicon, assets tĩnh
COPY --from=builder /app/public public
# File cần để chạy ứng dụng
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/node_modules node_modules

# Mở cổng 3000 để có thể truy cập ứng dụng Next.js
EXPOSE 3000

# Khởi động ứng dụng
CMD ["npm", "start"]
