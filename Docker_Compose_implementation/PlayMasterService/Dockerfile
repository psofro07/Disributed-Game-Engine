FROM node
# Create app directory
WORKDIR /usr/src/app

RUN npm install -g nodemon

COPY ./PlayMasterService/package.json /usr/src/app/package.json

RUN npm install && npm ls
# Copy app source code
RUN mv /usr/src/app/node_modules /usr/src/

COPY ./PlayMasterService /usr/src/app

EXPOSE 6000
CMD [ "npm", "start"]