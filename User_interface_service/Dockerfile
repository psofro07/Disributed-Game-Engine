FROM node
WORKDIR /usr/src/app

RUN npm install -g nodemon


COPY ./User_interface_service/package.json /usr/src/app/package.json
RUN npm install && npm ls
RUN mv /usr/src/app/node_modules /usr/src/

COPY ./User_interface_service /usr/src/app

CMD ["npm", "start"]

