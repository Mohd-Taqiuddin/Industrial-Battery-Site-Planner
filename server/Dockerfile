# Build Stage
FROM golang:alpine AS builder

WORKDIR /app

# 1. Copy Go Module files first (for better caching)
COPY go.mod ./
COPY go.sum ./ 

# 2. Download dependencies
RUN go mod download

# 3. Copy the rest of the source code
COPY . .

# 4. Build the Binary
RUN go build -o main .

# Run Stage
FROM alpine:latest
WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/main .

# Create the data directory
RUN mkdir -p ./data

# Expose Port
EXPOSE 8080

# Run
CMD ["./main"]