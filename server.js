import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import cors from 'cors'

/// services
import { loggerService } from './services/logger.service.js'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'
// routes
import { toyRoutes } from './api/toy/toy.routes.js'

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


app.use('/api/toy', toyRoutes)

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