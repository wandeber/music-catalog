FROM node:20-alpine

WORKDIR /app

CMD npm install && npm run dev