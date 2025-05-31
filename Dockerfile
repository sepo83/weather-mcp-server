FROM supercorp/supergateway:latest

USER root
RUN apk add --no-cache git nodejs npm

WORKDIR /app

RUN git clone https://github.com/sepo83/weather-mcp-server.git .
RUN npm install
RUN npm run build
CMD ["supergateway", "--stdio", "node dist/index.js", "--port", "8000"]
