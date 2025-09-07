import { makeId, readJsonFile, writeJsonFile } from "../../services/util.service.js"

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    add,
    update,
}

const users = readJsonFile('data/user.json')


async function query(filterBy = {}) {
    const filterdUsers = structuredClone(users)
    return filterdUsers
}

async function getById(userId) {
    const user = users.find(u => u._id === userId)
    if (!user) throw new Error(`cannot find user ${userId}`)
    return user
}

async function getByUsername(username) {
    const user = users.find(user => user.username === username)
    return user
}

async function remove(userId) {
    const idx = users.findIndex(u => u._id === userId)
    if (idx === -1) return Promise.reject(`cannot find user ${userId}`)
    users.splice(idx, 1)
    return _saveUsers()
}

async function add(credentials) {
    try {
        const { username, password, fullname } = credentials

        if (!username || !password || !fullname) {
            throw new Error("missing required credentials")
        }

        const isUserNameTaken = await getByUsername(username)

        if (isUserNameTaken) {
            throw new Error("user name is taken");
        }

        const userToAdd = {
            username,
            password,
            fullname,
            isAdmin: false,
            createdAt: Date.now(),
            _id: makeId(),
        }

        users.push(userToAdd)
        _saveUsers()

        const savedUser = { ...userToAdd }
        delete savedUser.password
        return savedUser

    } catch (err) {
        throw err;
    }

}

async function update(userToUpdate) {
    try {
        const { _id, username } = userToUpdate

        if (!_id) {
            throw new Error("missing required credentials");
        }

        const user = await getById(_id)

        if (!user) {
            throw new Error("user dont found");
        }


        if (username) {
            const isUserNameTaken = await getByUsername(username)

            if (isUserNameTaken) {
                throw new Error("user name is taken");
            }

            user.username = username
        }

        const idx = users.findIndex(u => u._id === _id)

        if (idx === -1) {
            throw new Error("user dont found");
        }

        users[idx] = { ...users[idx], ...user }
        _saveUsers()

        const savedUser = { ...users[idx] }
        delete savedUser.password
        return savedUser

    } catch (err) {
        throw err
    }

}


function _saveUsers() {
    return writeJsonFile('data/user.json', users)
}
