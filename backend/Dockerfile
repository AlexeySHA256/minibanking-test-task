FROM node:24

WORKDIR /app

COPY package* .

RUN npm ci

COPY . .

CMD ["npm", "run", "start:dev"]
