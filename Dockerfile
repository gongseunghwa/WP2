FROM node:10

WORKDIR /app

COPY package*.json /app/

EXPOSE 8080

CMD ["npm", "start"]