import http from 'http'
import path from 'path'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
// routes
import { toyRoutes } from './api/toy/toy.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'
// service
import { setupSocketAPI } from './services/socket.service.js'
// middleware
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

const app = express()
const server = http.createServer(app)

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:8080',
            'http://localhost:8080',
            'http://127.0.0.1:5173',
            'http://localhost:5173',
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}

app.all('*all', setupAsyncLocalStorage)

app.use('/api/toy', toyRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/review', reviewRoutes)

setupSocketAPI(server)


app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030
server.listen(PORT,
    () => console.log(`Server ready at port http://127.0.0.1:${PORT}`))