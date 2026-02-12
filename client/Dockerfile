# Build Stage
FROM node:20-alpine as builder
WORKDIR /app

# 1. Install dependencies
COPY package*.json ./
RUN npm install

# 2. Copy source code
COPY . .

# 3. Build Args 
ARG VITE_API_URL=http://localhost:8080/api
ENV VITE_API_URL=$VITE_API_URL

# 4. Build the app
RUN npm run build

# Serve Stage
FROM nginx:alpine

# Copy built assets from 'dist' (Vite's default output)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config (Ensure this file exists in your client folder!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]