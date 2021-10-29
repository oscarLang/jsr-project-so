# Stock market socket
To run the server locally:

`npm install`

`npm run start`

Port: 8200

Requeries a mongoDb instance to be running at port 27107

## Running
The socket uses intervals to emit a price update of a random stock, aswell as updating the history of each stock at a given timeout.
Socket.io is used for handling emits and the data is stored in mongodb
