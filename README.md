Node.JS Single room Chat
==========

Node JS, Express, Passport

This is a Chat system using Facebook and Twitter.

Install

	npm install 

Run server

	node server.js

Please note that the server.js file has the line
	io.set('transports', ['xhr-polling']);
That is because the appfog server where the demo is hosted does not support Websockets just yet, if you are using a server that does, you can remove or comment that line and it will use sockets instead of long-polling.

[Jose Luis Fonseca](http://josefonseca.me)

[Demo](http://sociedadelectrochat.aws.af.cm/)

Feel free to fork!