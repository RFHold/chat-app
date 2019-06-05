module.exports = function (app) {
    this.clients = []

    // general/user socket route
    app.ws('/ws', (ws, req) => {
        this.clients.push({ socket: ws, uid: req.session.userID })
        const keepAlive = setInterval(function (){
            ws.send(JSON.stringify({type: "ping", timestamp: new Date()}))
        }, 5000)

        ws.on('message', msg => {
            for (client of this.clients) {
                client.socket.send(msg)
            }
        })

        ws.on('close', () => {
            clearInterval(keepAlive)
            console.log('WebSocket was closed')
            for (i in this.clients) {
                const client = this.clients[i]
                if (client.socket.readyState >= 2) {
                    this.clients.splice(i, 1); 
                }
            }
        })
    })

    this.groups = {}

    // group socket route
    app.ws('/ws/groups/:group', (ws, req) => {
        if (!this.groups[req.params.group]) this.groups[req.params.group] = []
        this.groups[req.params.group].push({ socket: ws, uid: req.session.userID })

        const keepAlive = setInterval(function () {
            ws.send(JSON.stringify({ type: "ping", timestamp: new Date() }))
        }, 5000)

        ws.on('message', msg => {
            console.log(msg);
            for (client of this.groups[req.params.group]) {
                client.socket.send(msg)
            }
        })

        ws.on('close', () => {
            clearInterval(keepAlive)
            console.log('WebSocket was closed')
            for (i in this.groups[req.params.group]) {
                const client = this.groups[req.params.group][i]
                if (client.socket.readyState >= 2) {
                    this.groups[req.params.group].splice(i, 1);
                }
            }
        })
    })

};