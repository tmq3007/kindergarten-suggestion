# ============================
# Giai đoạn 1 - Build Next.js
# ============================
FROM node:18-alpine AS builder

# Tạo thư mục làm việc /app trong container
WORKDIR /app

# Kiểm tra thư mục đang làm việc
RUN echo "Current WORKDIR:" && pwd

# Sao chép package.json và package-lock.json trước để tối ưu hóa cache
COPY front/package.json front/package-lock.json ./

# Cài đặt dependencies
RUN npm install --frozen-lockfile

# Sao chép toàn bộ source code từ thư mục front vào container
COPY front ./

# Xác nhận đã copy xong
RUN echo "Files in /app before build:" && ls -la /app

# Build Next.js
RUN npm run build

# Kiểm tra sau khi build
RUN echo "Files in /app after build:" && ls -la /app && ls -la /app/.next

# ============================
# Giai đoạn 2 - Production
# ============================
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy files từ build stage
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/node_modules node_modules

# Kiểm tra thư mục cuối cùng trước khi chạy
RUN echo "Final files in /app:" && ls -la /app

# Mở cổng 3000 cho Next.js
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "start"]
