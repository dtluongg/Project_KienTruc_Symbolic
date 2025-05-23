FROM node:18

WORKDIR /app

COPY ../../package*.json ./
RUN npm install

COPY ../../src/redis_demo ./src/redis_demo
COPY ../../src/infrastructure ./src/infrastructure
COPY ../../src/data ./src/data

EXPOSE 3001

CMD ["node", "src/redis_demo/redis_server.js"] 