FROM node:alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./package.json /usr/src/app/
#COPY ../package-lock.json /usr/src/app/

RUN npm install

COPY ./ /usr/src/app

CMD ["npm", "run", "test"]
#RUN ./node_modules/.bin/jest --runInBand --detectOpenHandles tests/tests/api/routes/games/create.test.js
#RUN ./node_modules/.bin/jest --runInBand --detectOpenHandles tests/tests/listeners/czar-chosen.test.js
#RUN ./node_modules/.bin/jest --runInBand --detectOpenHandles --testPathPattern=tests/tests/
