FROM node:alpine-12
copy . .
RUN npm install --production
CMD npm start
