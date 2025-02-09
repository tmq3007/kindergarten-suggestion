# Giai đoạn 1 - Build
FROM node:18-alpine AS builder

WORKDIR /app

# Kiểm tra xem thư mục `/app/` có gì trước khi copy file
RUN ls -la /app

# Copy package.json và lock file vào cache để tối ưu cài đặt package
COPY package.json package-lock.json ./

# Kiểm tra xem thư mục `/app/` có gì sau khi copy package.json
RUN ls -la /app

RUN npm install --frozen-lockfile

# Copy toàn bộ code vào container
COPY . .

# Kiểm tra xem thư mục `/app/` có gì sau khi copy toàn bộ code
RUN ls -la /app

# Build Next.js app >>> mã nguồn đã build được lưu trong thư mục .next/
RUN npm run build

# Kiểm tra xem `/app/.next/` có được tạo ra không
RUN ls -la /app/.next

# Giai đoạn 2 - Production
FROM node:18-alpine

WORKDIR /app

# Kiểm tra thư mục `/app/` trước khi copy file từ builder stage
RUN ls -la /app

# Copy files từ build stage
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/node_modules node_modules

# Kiểm tra thư mục `/app/` sau khi copy file từ builder stage
RUN ls -la /app

EXPOSE 3000

CMD ["npm", "start"]
