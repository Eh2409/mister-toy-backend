import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { setBoolean } from './services/util.service.js'
import { toyService } from './services/toy.service.js'
import { loggerService } from './services/logger.service.js'

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


app.get('/api/toy', (req, res) => {

    const filterBy = {
        name: req.query.name || '',
        price: +req.query.price || 0,
        inStock: setBoolean(req.query.inStock),
        brands: req.query.brands || [],
        productTypes: req.query.productTypes || [],
        companies: req.query.companies || [],
        sortType: req.query.sortType || 'createdAt',
        dir: req.query.dir || -1,
        pageIdx: req.query.pageIdx || 0
    }

    toyService.query(filterBy)
        .then(data => res.send(data))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

app.delete('/api/toy/:toyId', (req, res) => {

    const { toyId } = req.params

    toyService.remove(toyId)
        .then(maxPage => res.send(maxPage))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

app.post('/api/toy', (req, res) => {

    const toy = req.body

    const { name, imgUrl, price, brands, productTypes, companies, inStock, description } = toy

    if (!name || !price || !inStock || !description) {
        return res.status(400).send('Required fields are missing')
    }

    const toyToSave = { name, imgUrl, price, brands, productTypes, companies, inStock, description }

    toyService.add(toyToSave)
        .then(savedToy => res.send(savedToy))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

app.put('/api/toy/:toyId', (req, res) => {

    const toy = req.body

    const { _id, name, imgUrl, price, brands, productTypes, companies, inStock, description } = toy

    if (!_id || !name || !price || !inStock || !description) {
        return res.status(400).send('Required fields are missing')
    }

    const toyToSave = { _id, name, imgUrl, price, brands, productTypes, companies, inStock, description }

    toyService.update(toyToSave)
        .then(savedToy => res.send(savedToy))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

app.get('/api/toy/labels', (req, res) => {

    toyService.getLabels()
        .then(labels => res.send(labels))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

app.get('/api/toy/:toyId', (req, res) => {

    const { toyId } = req.params

    toyService.getById(toyId)
        .then(toy => res.send(toy))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () => console.log(`Server ready at port http://127.0.0.1:${PORT}`))