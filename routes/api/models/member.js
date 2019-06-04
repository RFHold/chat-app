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

    app.delete("/api/member/:member", function (req, res) {
        session.user(req).then(sessionUser => {
            db.Member.findOne({
                where: { id: req.params.member },
                include: [{
                    model: db.Group,
                    include: [{
                        model: db.Member,
                        where: { user: sessionUser.id }
                    }]
                }]
            }).then(members => {
                member.destroy().then(deletedMembers => {
                    socket.send("deleteMember", member.Group.mapData, member.group)
                    socket.sendToUser("deleteMember", member.Group.mapData, member.user)
                }
            )}
            )
        }).catch(error => {
            res.status(500).json({ error: error })
        });
    });
};