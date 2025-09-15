import { loggerService } from "../../services/logger.service.js"
import { authService } from "./auth.service.js"

export async function login(req, res) {

    const credentials = req.body

    const { username, password } = credentials

    if (!username || !password) {
        throw new Error("missing required credentials")
    }

    try {
        const user = await authService.login({ username, password })
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)
        res.send(user)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}


export async function signup(req, res) {

    const credentials = req.body

    const { username, password, fullname, imgUrl } = credentials
    console.log('credentials:', credentials)

    if (!username || !password || !fullname) {
        throw new Error("missing required credentials")
    }

    try {
        const account = await authService.signup({ username, password, fullname, imgUrl })

        const user = await authService.login({ username, password })

        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)

        res.send(user)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}


export async function logout(req, res) {

    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }
}
