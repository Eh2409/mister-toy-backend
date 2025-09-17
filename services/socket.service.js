import { Server } from 'socket.io'
import { loggerService } from './logger.service.js'

var gIo = null

export function setupSocketAPI(http) {
    gIo = new Server(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        loggerService.info(`New connected socket [id: ${socket.id}]`)
        socket.on('disconnect', socket => {
            loggerService.info(`Socket disconnected [id: ${socket.id}]`)
        })
        socket.on('chat-set-topic', topic => {
            if (socket.myTopic === topic) return
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
                loggerService.info(`Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`)
            }
            socket.join(topic)
            socket.myTopic = topic
        })
        socket.on('chat-send-msg', msg => {
            loggerService.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`)
            socket.to(socket.myTopic).emit('chat-add-msg', msg)
        })
        socket.on('chat-delete-msg', msgId => {
            loggerService.info(`User[socketId: ${socket.id}]deleted a chat message. Emitting to topic: ${socket.myTopic}`)
            socket.to(socket.myTopic).emit('chat-remove-msg', msgId)
        })
        socket.on('emit-user-typing', username => {
            loggerService.info(`User [socketId: ${socket.id}] is typing in topic: ${socket.myTopic}`)
            socket.to(socket.myTopic).emit('event-user-typing', username)
        })
        socket.on('user-watch', userId => {
            loggerService.info(`user - watch from socket[id: ${socket.id}], on user ${userId}`)
            socket.join('watching:' + userId)
        })
        socket.on('set-user-socket', userId => {
            loggerService.info(`Setting socket.userId = ${userId} for socket[id: ${socket.id}]`)
            socket.userId = userId
        })
        socket.on('unset-user-socket', () => {
            loggerService.info(`Removing socket.userId for socket[id: ${socket.id}]`)
            delete socket.userId
        })

    })
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label.toString()).emit(type, data)
    else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
    userId = userId.toString()
    const socket = await _getUserSocket(userId)

    if (socket) {
        loggerService.info(`Emiting event: ${type} to user: ${userId} socket[id: ${socket.id}]`)
        socket.emit(type, data)
    } else {
        loggerService.info(`No active socket for user: ${userId} `)
        // _printSockets()
    }
}

async function broadcast({ type, data, room = null, userId }) {
    userId = userId.toString()

    loggerService.info(`Broadcasting event: ${type} `)
    const excludedSocket = await _getUserSocket(userId)
    if (room && excludedSocket) {
        loggerService.info(`Broadcast to room ${room} excluding user: ${userId} `)
        excludedSocket.broadcast.to(room).emit(type, data)
    } else if (excludedSocket) {
        loggerService.info(`Broadcast to all excluding user: ${userId} `)
        excludedSocket.broadcast.emit(type, data)
    } else if (room) {
        loggerService.info(`Emit to room: ${room} `)
        gIo.to(room).emit(type, data)
    } else {
        loggerService.info(`Emit to all`)
        gIo.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets()
    const socket = sockets.find(s => s.userId === userId)
    return socket
}
async function _getAllSockets() {
    const sockets = await gIo.fetchSockets()
    return sockets
}

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}): `)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId} `)
}

export const socketService = {
    setupSocketAPI,
    emitTo,
    emitToUser,
    broadcast,
}
