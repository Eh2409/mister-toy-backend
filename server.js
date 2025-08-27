import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

app.set('query parser', 'extended')


app.get('/', (req, res) => {
    res.send('Hello World')
})

app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () => console.log(`Server ready at port http://127.0.0.1:${PORT}`))