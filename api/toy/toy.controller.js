import { loggerService } from "../../services/logger.service.js"
import { setBoolean } from "../../services/util.service.js"
import { toyService } from "./toy.service.js"


export async function loadToys(req, res) {

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
}

export async function removeToy(req, res) {

    const { toyId } = req.params

    try {
        const maxPage = await toyService.remove(toyId)
        res.send(maxPage)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}

export async function addToy(req, res) {

    const toy = req.body

    const { name, imgUrls, price, brands, productTypes, companies, inStock, description } = toy

    if (!name || !price || !inStock || !description) {
        return res.status(400).send('Required fields are missing')
    }

    const toyToSave = { name, imgUrls, price, brands, productTypes, companies, inStock, description }

    try {
        const savedToy = await toyService.add(toyToSave)
        res.send(savedToy)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }
}

export async function updateToy(req, res) {

    const toy = req.body

    const { _id, name, imgUrls, price, inStock, description } = toy

    if (!_id || !name || !price || !inStock || !description) {
        return res.status(400).send('Required fields are missing')
    }

    try {
        const savedToy = await toyService.update(toy)
        res.send(savedToy)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }
}

export async function getLabels(req, res) {

    try {
        const labels = await toyService.getLabels()
        res.send(labels)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}

export async function getLabelsChartsData(req, res) {

    try {
        const chartsData = await toyService.getLabelsChartsData()
        res.send(chartsData)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}

export async function saveMsg(req, res) {
    const { loggedinUser } = req

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

}

export async function removeMsg(req, res) {

    const { toyId, msgId } = req.params

    if (!msgId || !toyId) {
        return res.status(400).send('Required fields are missing')
    }

    try {
        await toyService.removeMsg(toyId, msgId)
        res.send('msg removed!')
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}

export async function getToyById(req, res) {

    const { toyId } = req.params

    try {
        const toy = await toyService.getById(toyId)
        res.send(toy)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}