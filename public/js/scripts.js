Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

$(document).ready(function () {

    // submits a form through ajax and triggers the success event
    $(document).on("submit", "form.ajaxForm", function (e) {
        e.preventDefault();
        const form = $(this);
        const formObject = {};
        for (input of form.serializeArray()) {
            formObject[input.name] = input.value;
        }
        $.ajax({
            url: form.attr("action") || "./",
            method: form.attr("method") || "POST",
            data: formObject
        }).then(function (response) {
            form[0].reset();
            form.trigger("success", [response])
        }).catch(function (error) {
            console.log(error);
        });
    });

    // creates a socket connection for a given path
    const SocketConnection = function(path) {
        this.socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:')
        this.socketUrl = `${this.socketProtocol}//${window.location.hostname}:${location.port}${path}`
        this.socket = new WebSocket(this.socketUrl);
    }

    // constructs the app
    const App = function(){

        // selectors for the buttons, forms, and containers
        const groupsContainer = $("#groups > ul")
        const channelsDrawer = $("#channels").hide()
        const membersDrawer = $("#members").hide()
        const messagesDrawer = $("#messages").hide()
        const groupButtons = $("#groupButtons")
        const channelButtons = $("#channelButtons").hide()
        const channelsContainer = $("#channels > ul")
        const membersContainer = $("#members > ul")
        const messagesContainer = $("#message-list > .list-group")
        const messageForm = $("#message-form")
        const createChannelButton = $("#create-channel-button")
        const addMemberButton = $("#add-member-button")
        const logoutForm = $("#logout-form")

        let currentGroup;
        let currentChannel;

        //request links for api
        const groupsLink = (channel) => { return `/api/groups` }
        const groupLink = (group) => { return `/api/group/${group}` }
        const groupsWSLink = (group) => { return `/ws/groups/${group}` }
        const WSLink = () => { return `/ws` }
        const membersLink = (group) => { return `/api/members/${group}` }
        const memberLink = (group) => { return `/api/member/${group}` }
        const channelsLink = (group) => { return `/api/channels/${group}` }
        const channelLink = (group) => { return `/api/channel/${group}` }
        const messagesLink = (channel) => { return `/api/messages/${channel}` }
        const messageLink = (channel) => { return `/api/message/${channel}` }

        // constructs the session 
        this.Session = function() {

            this.genSocket;
            this.groupSocket;
            this.currentGroup;
            this.currentChannel;

            this.onSocket = (message) => {};

            // renders the groups
            const groups = () => {
                changeView("groups")
                getGroups().then(groups => {
                    groupsContainer.find("li:not(.static)").remove()
                    groupButtons.find("*").remove()
                    if (groups.length === 0) createGroupModal().then(group => { })
                    for (group of groups) {
                        eventHandler({ type: "newGroup", body: group })
                    }
                 })
            }
            
            // show login modal
            const login = () => {
                return loginModal().then(result => {
                    this.refreshGeneralSocket()
                    groups()
                })
            }
            
            // logout then show login modal
            this.logout = () => {
                logout().then(result => {
                    login()
                })
            }

            // refreshes the general websocket
            this.refreshGeneralSocket = () => {
                if (this.genSocket && this.genSocket.socket.readyState < 2) this.genSocket.socket.close()
                this.genSocket = new SocketConnection(WSLink())

                this.genSocket.socket.onmessage = (e) => {
                    const message = JSON.parse(e.data)
                    this.onSocket(message)
                }
            }

            // refreshes the group websocket
            this.refreshGroupSocket = (group) => {
                if (this.groupSocket && this.groupSocket.socket.readyState < 2) this.groupSocket.socket.close()
                this.groupSocket = new SocketConnection(groupsWSLink(group))

                this.groupSocket.socket.onmessage = (e) => {
                    const message = JSON.parse(e.data)
                    this.onSocket(message)
                }
            }

            // checks the status of the server session
            this.check = () => {
                const context = this
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: "/api/session",
                        method: "GET"
                    }).then(function (response) {
                        context.refreshGeneralSocket()
                        groups()
                        resolve()
                    }).catch(function (error) {
                        if (error.responseJSON.active === false) {
                            login().then(() => {
                                resolve()
                            })
                        } else {
                            reject(error);
                        }
                    });
                })
            }

        }

        // initiates the application
        this.start = () => {

            const session = new this.Session()
            session.check().then(() => {
                listeners(session)
            })
        }

        const eventHandler = (message) => {
            if (message.type === "ping") return true
            const type = message.type.match("([a-z]+)+([A-Z][a-z]+)")
            const object = message.body
            switch (type[1]) {
                case "new":
                    switch (type[2]) {
                        case "Message":
                            if (currentChannel == message.context) messagesContainer.prepend(buildMessage(object, messageLink(object.id)))
                            break;
                        case "Channel":
                            channelsContainer.append(buildButton(messagesLink(object.id), object.name, "messages", object.id, channelLink(object.id)))
                            channelButtons.append(buildCard(messagesLink(object.id), object.name, object.description, "messages", object.id))
                            break;
                        case "Member":
                            membersContainer.append(buildButton(memberLink(object.id), object.username, "member", object.id, memberLink(object.id)))
                            break;
                        case "Group":
                            groupsContainer.append(buildButton(channelsLink(object.id), object.name, "channels", object.id, groupLink(object.id)))
                            groupButtons.append(buildCard(channelsLink(object.id), object.name, object.description, "channels", object.id))
                            break;
                    }
                    break;
                case "delete":
                    switch (type[2]) {
                        case "Message":
                            if (currentChannel == message.context) messagesContainer.find(`li[data-id=${object.id}]`).remove()
                            break;
                        case "Channel":
                            if (currentChannel == object.id) changeView("channels")
                            channelsContainer.find(`li[data-id=${object.id}]`).remove()
                            channelButtons.find(`div[data-id=${object.id}]`).remove()
                            if (channelButtons.find(`div`).length === 0) createChannelModal(channelsLink(currentGroup)).then(channel => { })
                            break;
                        case "Member":
                            membersContainer.find(`li[data-id=${object.id}]`).remove()
                            break;
                        case "Group":
                            if (currentGroup == object.id) changeView("groups")
                            groupsContainer.find(`li[data-id=${object.id}]`).remove()
                            groupButtons.find(`div[data-id=${object.id}]`).remove()
                            if (groupButtons.find(`div`).length === 0) createGroupModal().then(group => { })
                            break;
                    }
                    break;
            }

        }

        // listens for input and connects to socketss
        const listeners = (session) => {

            session.onSocket = eventHandler

            $(document).on("click", ".action-button", function (e) {
                e.preventDefault()
                const button = $(this)
                const action = button.attr("data-action")
                const context = button.attr("data-context")
                switch (action) {
                    case "channels": 
                        changeView("channels")
                        currentGroup = context;
                        session.refreshGroupSocket(context)
                        groupsContainer.find(".action-button").removeClass("active")
                        getChannels(channelsLink(context)).then(channels => { 
                            channelsContainer.find("li:not(.static)").remove()
                            channelButtons.find("*").remove()
                            messagesContainer.find(".list-group-item").remove()
                            if (channels.length === 0) createChannelModal(channelsLink(context)).then(channel => { })
                            for (channel of channels) {
                                eventHandler({ type: "newChannel", body: channel })
                            }
                        })
                        getMembers(membersLink(context)).then(members => {
                            membersContainer.find("li:not(.static)").remove()
                            for (member of members){
                                eventHandler({ type: "newMember", body: member })
                            }
                        })
                        messageForm.attr("action", "")
                        createChannelButton.attr("href", channelsLink(context)).attr("data-context", context)
                        addMemberButton.attr("href", membersLink(context)).attr("data-context", context)
                        
                        break;
                    case "messages":
                        changeView("messages")
                        currentChannel = context;
                        channelsContainer.find(".action-button").removeClass("active")
                        getMessages(messagesLink(context)).then(messages => { 
                            messagesContainer.find(".list-group-item").remove()
                            for (message of messages) {
                                eventHandler({ type: "newMessage", body: message, context: context })
                            }
                        })
                        messageForm.attr("action", messagesLink(context))
                        break;
                    case "createGroup":
                        createGroupModal().then(group => { })
                        break;
                    case "createChannel":
                        createChannelModal(channelsLink(context)).then(channel => { })
                        break;
                    case "addMember":
                        addMemberModal(membersLink(context)).then(member => { })
                        break;
                    case "logout":
                        session.logout()
                        break;
                }
                button.addClass("active")
            })
        }
        // change visible items
        const changeView = view => {
            channelsDrawer.hide()
            membersDrawer.hide()
            messagesDrawer.hide()
            groupButtons.hide()
            channelButtons.hide()
            switch(view){
                case "groups":
                    groupButtons.show()
                    break
                case "channels":
                    channelsDrawer.show()
                    channelButtons.show()
                    membersDrawer.show()
                    break
                case "messages":
                    channelsDrawer.show()
                    messagesDrawer.show()
                    membersDrawer.show()
                    break
            }
        }

        // constructs the button for channels 
        const buildButton = (link, text, action, id, deletePath, editPath) => {
            const buttonContainer = $("<li>").addClass("nav-item").attr("data-id",id)
            const flexContainer = $("<div>").addClass("text-nowrap d-flex flex-row align-items-center justify-content-between")
            const actionsContainer = $("<div>").addClass("text-nowrap d-flex flex-row align-items-center")
            const deleteForm = $("<form>").addClass("ajaxForm m-1").attr("method", "DELETE").attr("action",deletePath)
            deleteForm.append($("<button>").addClass("btn btn-outline-danger ").attr("type", "submit").html(`<i class="fas fa-trash-alt "></i>`))
            const editForm = $("<form>").addClass("ajaxForm m-1").attr("method", "PATCH").attr("action",editPath)
            editForm.append($("<button>").addClass("btn btn-outline-secondary ").attr("type", "submit").html(`<i class="fas fa-pen"></i>`))
            flexContainer.append($("<a>")
                .addClass("nav-link action-button")
                .attr("href", link)
                .attr("data-context", id)
                .attr("data-action", action).text(text))
                if (editPath) {
                    actionsContainer.append(editForm)
                }
                if (deletePath) {
                    actionsContainer.append(deleteForm)
                } 
            return buttonContainer.append(flexContainer.append(actionsContainer))
        }

        // constructs the button for channels 
        const buildCard = (link, title, body, action, id) => {
            const cardContainer = $("<div>").addClass("card border-primary m-3 action-button").attr("data-id", id).attr("href", link).attr("data-context", id).attr("data-action", action).css("cursor", "pointer")
            const cardBody = $("<div>").addClass("card-body")
            const cardTitle = $("<div>").addClass("card-header").text(title)
            const cardText = $("<p>").addClass("card-text").text(body)
            return cardContainer.append(cardTitle, cardBody.append(cardText))
        }

        // constructs the message and puts it in the message div
        const buildMessage = (message, deletePath) => {
            const timestamp = new Date(message.timestamp)
            const stamp = `${timestamp.getHours()%12}:${timestamp.getMinutes().pad()} ${(timestamp.getHours() > 12) ? "PM" : "AM"}`
            const messageContainer = $("<li>").addClass("list-group-item").attr("data-id", message.id)
            const messageSpan = $(`<span>`).addClass("text-wrap").html(`<small class="text-muted">${stamp}</small> <strong>${message.username}:</strong> ${message.body}`)
            const flexContainer = $("<div>").addClass("text-nowrap d-flex flex-row align-items-center justify-content-between")
            const deleteMessage = $("<form>").addClass("ajaxForm m-1").attr("method", "DELETE").attr("action", deletePath)
            deleteMessage.append($("<button>").addClass("btn btn-outline-danger btn-sm").attr("type","submit").html(`<i class = "fas fa-trash-alt"></li>`))
            return messageContainer.append(flexContainer.append(messageSpan, deleteMessage))
        }

        // gets the messages for a given channel
        const getMessages = (link) => {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: link,
                    method: "GET"
                }).then(function (response) {
                    resolve(response.messages);
                }).catch(function (error) {
                    reject(error);
                });
            })
        }
        // gets the members for a given group.
        const getMembers = (link) => {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: link,
                    method: "GET"
                }).then(function (response) {
                    resolve(response.members);
                }).catch(function (error) {
                    reject(error);
                });
            })
        }

        // gets the channels for a given group
        const getChannels = (link) => {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: link,
                    method: "GET"
                }).then(function (response) {
                    resolve(response.channels);
                }).catch(function (error) {
                    reject(error);
                });
            })
        }

        // gets the groups for the current session user
        const getGroups = () => {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: groupsLink(),
                    method: "GET"
                }).then(function (response) {
                    resolve(response.groups);
                }).catch(function (error) {
                    reject(error);
                });
            })
        }

        // shows the create group modal and waits for form success
        const createGroupModal = () => {
            return new Promise(function (resolve, reject) {
                const modal = $("#createGroupModal")
                modal.modal('show')

                modal.find("form").on("success", function (e, result) {
                    modal.modal('hide')
                    resolve(result.group)
                    $(this).on("success", function () { return false; });
                })
            })
        }

        // shows the create channle modal and waits for form success
        const createChannelModal = (link) => {
            return new Promise(function (resolve, reject) {
                const modal = $("#createChannelModal")
                modal.modal('show')

                modal.find("form").attr("action", link).on("success", function (e, result) {
                    modal.modal('hide')
                    resolve(result.channel)
                    $(this).on("success", function () { return false; });
                })
            })
        }

        // shows the add member modal and waits for form success
        const addMemberModal = (link) => {
            return new Promise(function (resolve, reject) {
                const modal = $("#addMemberModal")
                modal.modal('show')

                modal.find("form").attr("action", link).on("success", function (e, result) {
                    modal.modal('hide')
                    resolve(result.member)
                    $(this).on("success", function () { return false; });
                })
            })
        }

        // shows the login modal and waits for form success
        const loginModal = () => {
            return new Promise(function (resolve, reject) {
                const modal = $("#loginModal")
                modal.modal('show')
                const form = modal.find("form")
                const modalTitle = modal.find(".modal-title")

                $(modal).on("click", ".toggleLoginForm", function (e) {
                    let state = "login"
                    let action = "/api/login"
                    let title = "Login"
                    let toggleButton = "Create Account"
                    $(".passwordConfirm").addClass("d-none")
                    if (form.attr("data-state") === "login") {
                        state = "create"
                        action = "/api/users"
                        title = "Create Account"
                        toggleButton = "Existing User"
                        $(".passwordConfirm").removeClass("d-none")
                    }
                    form.attr("data-state", state)
                    form.attr("action", action)
                    modalTitle.text(title)
                    form.find(".toggleLoginForm").text(toggleButton)
                })

                form.on("success", function (e, result) {
                    modal.modal('hide')
                    resolve(result)
                    $(modal).off("click", ".toggleLoginForm")
                    $(this).on("success", function () { return false; });
                })
            })
        }

        // submits the login form
        const logout = () => {
            return new Promise(function (resolve, reject) {
                logoutForm.submit()
                logoutForm.on("success", function (e, result) {
                    resolve(result)
                    $(this).on("success", function () { return false; });
                })
            })
        }
    }

    const app = new App()

    app.start()
})