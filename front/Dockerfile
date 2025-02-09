# Sử dụng image chính thức của Node.js
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file package.json và package-lock.json vào thư mục làm việc
COPY front/package.json front/package-lock.json ./

# Cài đặt các phụ thuộc của dự án
RUN npm install --frozen-lockfile

# Copy toàn bộ mã nguồn của dự án vào thư mục làm việc
COPY front ./

# Xây dựng ứng dụng
RUN npm run build

# Sử dụng một image khác để triển khai ứng dụng (nếu cần)
FROM node:18-alpine
WORKDIR /app

# Copy các file từ giai đoạn xây dựng vào image triển khai
COPY --from=builder /app .

# Chạy ứng dụng
CMD ["npm", "start"]
