import { loggerService } from "../../services/logger.service.js"
import { userService } from "./user.service.js"


export async function loadUsers(req, res) {

    try {
        const users = await userService.query()
        res.send(users)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}

export async function removeUser(req, res) {

    const { userId } = req.params

    try {
        await userService.remove(userId)
        res.send('user removed')
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}


export async function updateUser(req, res) {

    const credentials = req.body

    const { _id, username } = credentials

    if (!_id) {
        throw new Error("missing required credentials")
    }

    const userToSave = { _id, username }

    try {
        const savedUser = await userService.update(userToSave)
        res.send(savedUser)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}


export async function getUserById(req, res) {

    const { userId } = req.params

    try {
        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}

