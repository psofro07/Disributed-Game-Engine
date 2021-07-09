#This Project was part of the Distributed Systems course of ECE Technical University of Crete.


There are 2 possible ways of running the distributed game engine application:
	1) Using the docker engine and the docker-compose tool.
	2) Using minikube to simulate a Kubernetes cluster with one Node (preffered way)
	   and the kubectl tool.
	

#DOCKER AND DOCKER-COMPOSE
To run the application using this method, you need to be in the /Docker_Compose_implementation directory
and just use the command: "docker-compose up" which uses the docker-compose.yml configuration file to
create the services described within it. Once you are done, you can use the "docker-compose down -v"
command to delete all the containers their associated volumes. The application can be reached from the url
"localhost:3000".


#KUBERNETES WITH MINIKUBE AND KUBECTL
To run the application using this method, you need to have a minikube cluster up and running,
you can do this by executing the command "minikube start". Once everything is configured, head over
to the /kubernetes_implementation directory and run the command "make", which will create all the
necessary deployment, service, configmap and secret objects. When all the pods are in the "RUNNING" state
you can access the application with the following command: "minikube service user-interface-service".
When you are done you can use the command "make clean" to delete everything, the volumes 
will be deleted by deleting the minikube cluster ("minikube delete").


#FUNCTIONALITY THAT WAS REQUESTED BUT NOT IMPLEMENTED:
There is no spectator functionality because the PlayMaster service does not save the board state. Only the latest move made.
That means that if a player decides to redirect to another page, there is no way of continuing the active game.


#NOTES:
An administrator is created during the initialization with the following information:
Username: Pipis
Password: 1234

For practice plays there is a 10 second timeout for players to connect.

Some tournaments are created by default, and each player is assigned some practice and tournament scores (800 each).

For simultaneous user logins on the same machine different browsers are needed to avoid conflicts with session variables.

Registration assigns the "Player" role automatically and the administrator can change a user's role to "Admin" or "Official" in the admin table.


If you are using the docker-compose method, the first time after the initial build the authentication service may crash
because it cannot establish connection with the database. To solve this just restart the application with the compose tool (docker-compose down and up afterwards).
This happens only the first time.


The code used for each implementation can be found in it's respective folder. The main difference,
is that in the docker-compose implementation most of the url's that are used are hardcoded, whereas
in the kubernetes implementation everything is configured to work with enviromental variables. Also
the docker-compose implementation uses 3rd-party images found in dockerhub, and are further configured
with Dockerfiles and the docker-compose.yaml file. For the kubernetes implementation we made custom
images and uploaded them to our own repositories and are pulled from there. The code implementation
is still inside for completeness purposes. Finally for the docker-compose method we have also
included the following services: phpmyadmin, mongo-express and pgAdmin for testing our databases.


#Credits for chess and tic-tac-toe js implementation:
https://github.com/jhlywa/chess.js
https://chessboardjs.com/
https://dev.to/bornasepic/pure-and-simple-tic-tac-toe-with-javascript-4pgn