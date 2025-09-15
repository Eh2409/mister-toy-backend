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

    const { loggedinUser } = req
    const credentials = req.body

    const { _id, username, imgUrl } = credentials

    if (!_id) {
        return res.status(400).send('Required fields are missing')
    }

    if (loggedinUser?._id !== _id) {
        return res.status(403).send('You are not authorized to update this user')
    }

    const userToSave = { _id, username, imgUrl }

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

