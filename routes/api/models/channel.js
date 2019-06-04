const session = require(rootPath + "/session/sessionController")

const db = require(rootPath + "/models")

module.exports = function (app, socket) {

    app.post("/api/channels/:group", function (req, res) {
        session.user(req).then(sessionUser => {
            db.Group.findOne({
                where: { id: req.params.group },
                include: [{
                    model: db.Member,
                    where: { user: sessionUser.id }
                }]
            }).then(group => {
                group.createChannel({
                    name: req.body.name,
                    description: req.body.description
                }).then(channel => {
                    socket.send("channel", channel.mapData, channel.group)
                    res.status(200).json({ success: true, channel: channel.mapData })
                })
            })
        }).catch(error => {
            res.status(500).json({ error: error })
        });
    });

    app.get("/api/channels/:group", function (req, res) {
        session.user(req).then(sessionUser => {
            db.Channel.findAll({
                include: [{
                    model: db.Group,
                    where: { id: req.params.group },
                    include: [{
                        model: db.Member,
                        where: { user: sessionUser.id }
                    }]
                }]
            }).then(channels => {
                res.status(200).json({
                    success: true, channels: channels.map(function (channel) {
                        return channel.mapData
                    })
                })
            })
        }).catch(error => {
            res.status(500).json({ error: error })
        });
    });

    app.delete("/api/channel/:channel", function (req, res) {
        session.user(req).then(sessionUser => {
            db.Channel.findOne({
                where: { id: req.params.channel },
                include: [{
                    model: db.Group,
                    include: [{
                        model: db.Member,
                        where: { user: sessionUser.id }
                    }]
                }]
            }).then(channel => {
                channel.destroy().then(deletedChannels => {
                        socket.send("deleteChannel", channel.mapData, channel.group)
                    }
                )
            })
        }).catch(error => {
            res.status(500).json({ error: error })
        });
    });

};