FROM node
WORKDIR /usr/src/app

RUN npm install -g nodemon


COPY ./Authentication_service/package.json /usr/src/app/package.json
RUN npm install && npm ls
RUN mv /usr/src/app/node_modules /usr/src/

COPY ./Authentication_service /usr/src/app

CMD ["npm", "start"]


#ENTRYPOINT ["nodemon", "--legacy-watch", "/usr/src/app/index.js"]
