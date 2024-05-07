FROM node:alpine

RUN mkdir -p /usr/src/app

RUN apk add --no-cache openssh-client git

WORKDIR /usr/src/app

RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN npm install -g tsx

#
COPY ./package.json /usr/src/app/
COPY ../package-lock.json /usr/src/app/
#






RUN --mount=type=ssh npm install
#CMD ["tsx", "server"]
#CMD [ "node", "app" ]
CMD ["tail", "-f", "/dev/null"]

EXPOSE 4005