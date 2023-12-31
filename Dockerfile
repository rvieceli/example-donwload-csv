FROM node:18-alpine3.18

WORKDIR /app

COPY package*.json ./

RUN npm install ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]

