<<<<<<< HEAD
FROM node
WORKDIR /usr/src/app

RUN npm install -g nodemon


COPY ./Authentication_service/package.json /usr/src/app/package.json
RUN npm install && npm ls
RUN mv /usr/src/app/node_modules /usr/src/

COPY ./Authentication_service /usr/src/app

CMD ["npm", "start"]


#ENTRYPOINT ["nodemon", "--legacy-watch", "/usr/src/app/index.js"]
=======
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
>>>>>>> d3b2714932f8dd8bd2be6f5bd5be9a6846a4ad3d
