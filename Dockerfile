
FROM node:14.17.1-alpine

RUN mkdir /src
RUN mkdir /src/server

RUN npm install nodemon -g
WORKDIR /src

ADD ./sso-client/server/package.json /src/server/package.json
RUN cd ./server && npm install

ADD ./sso-client/package.json /src/package.json
RUN npm install

COPY ./sso-client .
EXPOSE 8000
CMD npm start