# Build Stage
FROM golang:alpine AS builder

WORKDIR /app

# 1. Copy files
COPY . .

# 2. Initialize Module if missing & Get Dependencies
RUN [ ! -f go.mod ] && go mod init server || true
RUN go get github.com/rs/cors
RUN go mod tidy

# 3. Build the Binary
RUN go build -o main .

# Run Stage
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .

# Expose Port
EXPOSE 8080

# Run
CMD ["./main"]