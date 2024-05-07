FROM node:alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

#ARG NPM_TOKEN

COPY ./package.json /usr/src/app/
COPY ./.npmrc /usr/src/app/
#COPY ../package-lock.json /usr/src/app/

#RUN ECHO $NPM_TOKEN

RUN npm install
RUN npm install -D vitest

COPY ./ /usr/src/app

CMD ["npm", "run", "test"]
#CMD [ "node", "app" ]

#EXPOSE 4005