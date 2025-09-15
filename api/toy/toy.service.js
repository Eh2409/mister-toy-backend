import { ObjectId } from "mongodb"
import { dbService } from "../../services/db.service.js"
import { makeId } from "../../services/util.service.js"

export const toyService = {
    query,
    getById,
    remove,
    add,
    update,
    getLabels,
    getLabelsChartsData,
    saveMsg,
    removeMsg
}

const PAGE_SIZE = 8

async function query(filterBy = {}) {
    const { criteria, sort, skip } = _buildCriteria(filterBy)

    const limit = filterBy.pageIdx !== undefined ? PAGE_SIZE : 0

    const collection = await dbService.getCollection('toy')
    const toys = await collection
        .find(criteria)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray()

    const totalToys = await collection.countDocuments(criteria)
    const maxPageCount = Math.ceil(totalToys / PAGE_SIZE)

    return { toys, maxPageCount }
}

async function getById(toyId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(toyId) }
        const collection = await dbService.getCollection('toy')
        const toy = await collection.findOne(criteria)
        return toy
    } catch (err) {
        throw err
    }
}

async function remove(toyId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(toyId) }
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne(criteria)
        return getMaxPage()
    } catch (err) {
        throw err
    }
}

async function getMaxPage() {
    try {
        const collection = await dbService.getCollection('toy')
        const totalToys = await collection.countDocuments()
        const maxPageCount = Math.ceil(totalToys / PAGE_SIZE)
        return maxPageCount
    } catch (err) {
        throw err
    }
}


async function add(toyToSave) {
    try {
        toyToSave.msgs = []
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toyToSave)
        return toyToSave
    } catch (err) {
        throw err
    }
}

async function update(toy) {
    const { _id, name, imgUrls, price, brands, productTypes, companies, inStock, description } = toy
    const toyToSave = { name, imgUrls, price, brands, productTypes, companies, inStock, description }
    const toyId = _id

    try {
        const criteria = { _id: ObjectId.createFromHexString(toyId) }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne(criteria, { $set: toyToSave })
        return toy
    } catch (err) {
        throw err
    }
}


async function getLabels() {

    const brands = [
        "Naruto",
        "Dragon Ball",
        "One Piece",
        "My Hero Academia",
        "Demon Slayer"
    ]

    const productTypes = [
        "Action Figure",
        "Nendoroid",
        "Model Kit",
        "Plush Toy",
        "Statue"
    ]

    const companies = [
        "Bandai",
        "Good Smile Company",
        "Banpresto",
        "Kotobukiya",
        "Funko"
    ]

    return { brands, productTypes, companies }
}


async function getLabelsChartsData() {
    try {
        const [brands, productTypes, companies] = await Promise.all(
            [calculateLabelPercentages('brands'),
            calculateLabelPercentages('productTypes'),
            calculateLabelPercentages('companies')])

        return { brands, productTypes, companies }

    } catch (err) {
        throw err
    }
}


async function calculateLabelPercentages(LabelType) {
    const criteria = { inStock: true }
    const collection = await dbService.getCollection('toy')
    const toys = await collection.find(criteria).toArray()

    const labelCounts = toys.reduce((acc, toy) => {

        toy[LabelType].forEach(label => {
            if (!acc[label]) acc[label] = 1
            else acc[label]++
            if (!acc['totalLength']) acc['totalLength'] = 1
            else acc['totalLength']++

            return
        })
        return acc
    }, {})

    const labelPercentagesData = Object.entries(labelCounts)
        .filter(([key]) => key !== 'totalLength')
        .map(([key, val]) => {
            return {
                name: key,
                percent: (val / (labelCounts['totalLength']) * 100).toFixed(1),
                toysCount: val
            }

        })

    return labelPercentagesData
}

async function saveMsg(msgToSave, toyId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(toyId) }

        msgToSave.id = makeId()
        msgToSave.at = Date.now()

        const collection = await dbService.getCollection('toy')
        await collection.updateOne(criteria, { $push: { msgs: msgToSave } })

        return msgToSave
    } catch (err) {
        throw err
    }
}

async function removeMsg(toyId, msgId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(toyId) }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne(criteria, { $pull: { msgs: { id: msgId } } })
        return
    } catch (err) {
        throw err
    }
}



/// private funcs

function _buildCriteria(filterBy = {}) {

    const criteria = {}

    if (filterBy.name) {
        criteria['name'] = { $regex: filterBy.name, $options: 'i' }
    }

    if (filterBy.price) {
        criteria.price = { $gte: filterBy.price }
    }

    if (filterBy.inStock !== undefined) {
        criteria['inStock'] = filterBy.inStock
    }

    if (filterBy.brands?.length > 0) {
        criteria.brands = { $in: filterBy.brands }
    }

    if (filterBy.productTypes?.length > 0) {
        criteria.productTypes = { $in: filterBy.productTypes }
    }

    if (filterBy.companies?.length > 0) {
        criteria.companies = { $in: filterBy.companies }
    }


    const sort = {}

    if (filterBy.sortType && filterBy.dir) {
        const sortBy = filterBy.sortType === 'createdAt' ? '_id' : filterBy.sortType
        sort[sortBy] = +filterBy.dir
    } else {
        sort['_id'] = -1
    }


    var skip = filterBy.pageIdx !== undefined ? filterBy.pageIdx * PAGE_SIZE : 0

    return { criteria, sort, skip }
}
