FROM node:alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

#COPY ../package.json /usr/src/app/
#COPY ../package-lock.json /usr/src/app/

RUN npm install

COPY ../ /usr/src/app

CMD ["npm", "run", "watch"]
#CMD [ "node", "app" ]

EXPOSE 4005