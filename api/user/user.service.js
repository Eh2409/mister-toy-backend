import { dbService } from "../../services/db.service.js"
import { ObjectId } from "mongodb"

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    add,
    update,
}


async function query(filterBy = {}) {
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find().toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp().getTime()
            return user
        })

        return users
    } catch (err) {
        throw err
    }
}

async function getById(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)
        delete user.password
        return user
    } catch (err) {
        throw err
    }
}

async function getByUsername(username) {
    try {
        const criteria = { username: username }
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)
        return user
    } catch (err) {
        throw err
    }
}

async function remove(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }
        const collection = await dbService.getCollection('user')
        await collection.deleteOne(criteria)
        return
    } catch (err) {
        throw err
    }
}

async function add(credentials) {
    try {
        const { username, password, fullname, imgUrl } = credentials

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
            imgUrl: imgUrl || ''
        }

        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)

        delete userToAdd.password

        return userToAdd

    } catch (err) {
        throw err;
    }

}

async function update(UpdatedCredentials) {
    try {
        const { _id, username, imgUrl } = UpdatedCredentials

        if (!_id) {
            throw new Error("missing required credentials");
        }

        const user = await getById(_id)

        if (!user) {
            throw new Error("user dont found");
        }

        const userToUpdate = {}

        if (username) {
            const isUserNameTaken = await getByUsername(username)

            if (isUserNameTaken) {
                throw new Error("user name is taken");
            }

            user.username = username
            userToUpdate.username = username
        }

        if (imgUrl) user.imgUrl = imgUrl

        const criteria = { _id: ObjectId.createFromHexString(_id) }
        const collection = await dbService.getCollection('user')
        await collection.updateOne(criteria, { $set: userToUpdate })
        return user

    } catch (err) {
        throw err
    }

}
