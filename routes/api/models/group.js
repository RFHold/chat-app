const session = require(rootPath + "/session/sessionController")

const db = require(rootPath + "/models")

module.exports = function (app, socket) {

    app.post("/api/groups", function (req, res) {
        session.user(req).then(sessionUser => {
            sessionUser.createGroup({
                name: req.body.name,
                description: req.body.description
            }).then(group => {
                group.createMember({
                    user: sessionUser.id
                }).then(member => {
                    socket.sendToUser("newMember", group.mapData, member.user)
                    res.status(200).json({ success: true, group: group.mapData })
                })
            })
        }).catch(error => {
            res.status(500).json({ error: error })
        });
    });

    app.get("/api/groups", function (req, res) {
        session.user(req).then(sessionUser => {
            db.Group.findAll({
                include: [{
                    model: db.Member,
                    where: { user: sessionUser.id }
                }]
            }).then(groups => {
                res.status(200).json({
                    success: true, groups: groups.map(function (group) {
                        return group.mapData
                    })
                })
            })
        }).catch(error => {
            res.status(500).json({ error: error })
        });
    })

    app.delete("/api/group/:group", function (req, res) {
        session.user(req).then(sessionUser => {
            sessionUser.getGroups({
                where: { id: req.params.group },
                include: [{
                    model: db.Member
                }]
            }).then(groups => {
                const group = groups[0]
                group.destroy().then(deletedGroups => {
                    for(member of group.Members) {
                        socket.sendToUser("deleteMember", group.mapData, member.user)
                    }
                })
            })
        }).catch(error => {
            res.status(500).json({ error: error })
        });
    });

};