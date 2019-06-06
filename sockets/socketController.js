module.exports = function (sockets){

    // sends a message to a given groups socket
    this.send = (type, body, group, context) => {
        for (client of sockets.groups[group] || []) {
            client.socket.send(JSON.stringify({ type: type, body: body, context: context || group }))
        }
    }

    // sends a message to a given users socket
    this.sendToUser = (type, body, user, context) => {
        for (client of sockets.clients) {
            if (client.uid === user) {
                client.socket.send(JSON.stringify({ type: type, body: body, context: context || user }))
            }
        }
    }
}