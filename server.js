import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { setBoolean } from './services/util.service.js'
import { loggerService } from './services/logger.service.js'

import { toyService } from './services/toy.service.js'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'

const app = express()

const corsOptions = {
    origin: [
        'http://127.0.0.1:8080',
        'http://localhost:8080',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
    ],
    credentials: true
}


app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.use(cors(corsOptions))
app.set('query parser', 'extended')


app.get('/api/toy', async (req, res) => {

    const filterBy = {
        name: req.query.name || '',
        price: +req.query.price || 0,
        inStock: setBoolean(req.query.inStock),
        brands: req.query.brands || [],
        productTypes: req.query.productTypes || [],
        companies: req.query.companies || [],
        sortType: req.query.sortType || 'createdAt',
        dir: +req.query.dir || -1,
        pageIdx: req.query.pageIdx
    }

    try {
        const data = await toyService.query(filterBy)
        res.send(data)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }
})

app.delete('/api/toy/:toyId', async (req, res) => {

    const { toyId } = req.params

    try {
        const maxPage = await toyService.remove(toyId)
        res.send(maxPage)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

})

app.post('/api/toy', async (req, res) => {

    const toy = req.body

    const { name, imgUrl, price, brands, productTypes, companies, inStock, description } = toy

    if (!name || !price || !inStock || !description) {
        return res.status(400).send('Required fields are missing')
    }

    const toyToSave = { name, imgUrl, price, brands, productTypes, companies, inStock, description }

    try {
        const savedToy = await toyService.add(toyToSave)
        res.send(savedToy)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }
})

app.put('/api/toy/:toyId', async (req, res) => {

    const toy = req.body

    const { _id, name, imgUrl, price, brands, productTypes, companies, inStock, description } = toy

    if (!_id || !name || !price || !inStock || !description) {
        return res.status(400).send('Required fields are missing')
    }

    const toyToSave = { _id, name, imgUrl, price, brands, productTypes, companies, inStock, description }

    try {
        const savedToy = await toyService.update(toyToSave)
        res.send(savedToy)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }
})

app.get('/api/toy/labels', async (req, res) => {

    try {
        const labels = await toyService.getLabels()
        res.send(labels)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

})

app.get('/api/toy/charts', async (req, res) => {

    try {
        const chartsData = await toyService.getLabelsChartsData()
        res.send(chartsData)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

})

app.post('/api/toy/:toyId/msg', async (req, res) => {

    const loginToken = req?.cookies?.loginToken
    const loggedinUser = authService.validateToken(loginToken)

    if (!loggedinUser) {
        return res.status(401).send('Not authorized')
    }

    const { toyId } = req.params
    const { txt } = req.body

    if (!txt || !toyId) {
        return res.status(400).send('Required fields are missing')
    }

    const msgToSave = {
        txt,
        by: { _id: loggedinUser._id, username: loggedinUser.username }
    }

    try {
        const savedMsg = await toyService.saveMsg(msgToSave, toyId)
        res.send(savedMsg)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

})

app.get('/api/toy/:toyId', async (req, res) => {

    const { toyId } = req.params

    try {
        const toy = await toyService.getById(toyId)
        res.send(toy)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

})

/// user

app.get('/api/user', async (req, res) => {

    try {
        const users = await userService.query()
        res.send(users)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

})

app.delete('/api/user/:userId', async (req, res) => {

    const { userId } = req.params

    try {
        await userService.remove(userId)
        res.send('user removed')
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

})

// app.post('/api/user', async (req, res) => {

//     const credentials = req.body

//     const { username, password, fullname } = credentials

//     if (!username || !password || !fullname) {
//         throw new Error("missing required credentials")
//     }

//     try {
//         const SavedUser = await userService.add({ username, password, fullname })
//         res.send(SavedUser)
//     } catch (err) {
//         loggerService.error(err)
//         res.status(400).send(err)
//     }
// })

app.put('/api/user/:userId', async (req, res) => {

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

})

app.get('/api/user/:userId', async (req, res) => {

    const { userId } = req.params

    try {
        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

})

app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

// auth

app.post('/api/auth/login', async (req, res) => {

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

})


app.post('/api/auth/signup', async (req, res) => {

    const credentials = req.body

    console.log(credentials);

    const { username, password, fullname } = credentials

    if (!username || !password || !fullname) {
        throw new Error("missing required credentials")
    }

    try {
        const account = await userService.add({ username, password, fullname })

        const user = await authService.login({ username, password })

        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)

        res.send(user)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

})


app.post('/api/auth/logout', async (req, res) => {

    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }
})


const PORT = process.env.PORT || 3030
app.listen(PORT, () => console.log(`Server ready at port http://127.0.0.1:${PORT}`))