FROM node
WORKDIR /usr/src/app

RUN npm install -g nodemon


COPY ./package.json /usr/src/app/package.json
RUN npm install && npm ls
RUN mv /usr/src/app/node_modules /usr/src/

COPY ./ /usr/src/app

CMD ["npm", "start"]

EXPOSE 4000
#ENTRYPOINT ["nodemon", "--legacy-watch", "/usr/src/app/index.js"]
