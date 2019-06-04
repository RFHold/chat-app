const session = require(rootPath + "/session/sessionController")

const db = require(rootPath + "/models")

module.exports = function (app, socket) {

    app.post("/api/members/:group", function (req, res) {
        session.user(req).then(sessionUser => {
            db.Group.findOne({
                where: { id: req.params.group },
                include: [{
                    model: db.Member,
                    where: { user: sessionUser.id }
                }]
            }).then(group => {
                db.User.findOne({
                    where: { username: req.body.username }
                }).then(user => {
                    group.createMember({
                        user: user.id
                    }).then(member => {
                        socket.sendToUser("newMember", group.mapData, member.user)
                        res.status(200).json({ success: true, member: member.mapData })
                    })
                })
            })
        }).catch(error => {
            res.status(500).json({ error: error })
        });
    });

    app.get("/api/members/:group", function (req, res) {
        session.user(req).then(sessionUser => {
            db.Member.findAll({
                include: [{
                    model: db.Group,
                    where: { id: req.params.group },
                    include: [{
                        model: db.Member,
                        where: { user: sessionUser.id }
                    }]
                }]
            }).then(members => {
                res.status(200).json({
                    success: true, members: members.map(function (member) {
                        return member.mapData
                    })
                })
            })
        }).catch(error => {
            res.status(500).json({ error: error })
        });
    });

};