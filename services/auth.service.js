import Cryptr from 'cryptr'
import { userService } from './user.service.js';

const cryptr = new Cryptr(process.env.SERCRET1 || 'secret-user-1000')

export const authService = {
    login,
    getLoginToken,
    validateToken
}


async function login({ username, password }) {

    if (!username || !password) {
        throw new Error("missing required credentials");
    }

    const user = await userService.getByUsername(username)

    if (!user || user?.password !== password) {
        throw new Error("username or password invalid");
    }

    delete user.password

    return user
}


function getLoginToken(user) {
    user = {
        _id: user?._id,
        username: user?.username,
        fullname: user?.fullname,
        isAdmin: user?.isAdmin,
    }

    const str = JSON.stringify(user)
    const loginToken = cryptr.encrypt(str)
    return loginToken
}

function validateToken(loginToken) {
    if (!loginToken) return null

    const json = JSON.parse(loginToken)
    const loggedinUser = cryptr.decrypt(json)
    return loggedinUser
}