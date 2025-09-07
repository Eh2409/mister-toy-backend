import { makeId, readJsonFile, writeJsonFile } from "./util.service.js"

export const toyService = {
    query,
    getById,
    remove,
    add,
    update,
    getLabels,
    getLabelsChartsData,
    saveMsg
}

const toys = readJsonFile('data/toy.json')

const PAGE_SIZE = 8

async function query(filterBy = {}) {

    var filteredToys = structuredClone(toys)

    if (filterBy.name) {
        const regExp = new RegExp(filterBy.name, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }

    if (filterBy.price) {
        filteredToys = filteredToys.filter(toy => toy.price >= filterBy.price)
    }


    if (filterBy.inStock !== undefined) {
        filteredToys = filteredToys.filter(toy => toy.inStock === filterBy.inStock)
    }


    if (filterBy.brands?.length > 0) {
        filteredToys = filteredToys.filter(toy => {
            return filterBy.brands.some(brand => toy.brands.includes(brand))
        })
    }

    if (filterBy.productTypes?.length > 0) {
        filteredToys = filteredToys.filter(toy => {
            return filterBy.productTypes.some(productType => toy.productTypes.includes(productType))
        })
    }

    if (filterBy.companies?.length > 0) {
        filteredToys = filteredToys.filter(toy => {
            return filterBy.companies.some(company => toy.companies.includes(company))
        })
    }



    if (filterBy.sortType && filterBy.dir) {
        if (filterBy.sortType === 'price') {
            filteredToys = filteredToys.sort((t1, t2) => (t1.price - t2.price) * filterBy.dir)
        } else if (filterBy.sortType === 'createdAt') {
            filteredToys = filteredToys.sort((t1, t2) => (t1.createdAt - t2.createdAt) * filterBy.dir)
        } else if (filterBy.sortType === 'name') {
            filteredToys = filteredToys.sort((t1, t2) => (t1.name.localeCompare(t2.name)) * filterBy.dir)
        }
    }

    const maxPageCount = Math.ceil(filteredToys.length / PAGE_SIZE)



    if (filterBy.pageIdx !== undefined) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE
        filteredToys = filteredToys.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return { toys: filteredToys, maxPageCount }

}


async function getById(toyId) {
    const toy = toys.find(t => t._id === toyId)
    if (!toy) throw new Error(`cannot find toy ${toyId}`)
    return toy
}

async function remove(toyId) {
    const idx = toys.findIndex(t => t._id === toyId)
    if (idx === -1) throw new Error(`cannot find toy ${toyId}`)
    toys.splice(idx, 1)
    return _saveToys().then(() => getMaxPage())
}

async function getMaxPage() {
    try {
        const maxPageCount = Math.ceil(toys.length / PAGE_SIZE)
        return maxPageCount
    } catch (err) {
        throw err
    }
}


async function add(toyToSave) {

    toyToSave.createdAt = Date.now()
    toyToSave._id = makeId()
    toyToSave.msgs = []

    toys.unshift(toyToSave)

    return _saveToys().then(() => toyToSave)
}

async function update(toyToSave) {

    const idx = toys.findIndex(t => t._id === toyToSave._id)
    if (idx === -1) throw new Error(`cannot find toy ${toyId}`)

    toys[idx] = { ...toys[idx], ...toyToSave }

    const savedToy = toys[idx]

    return _saveToys().then(() => savedToy)
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
    const toysCopy = structuredClone(toys)
    const labelCounts = toysCopy.reduce((acc, toy) => {

        if (!toy.inStock) return acc

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
        const toy = await getById(toyId)

        if (!toy) {
            throw new Error(`Toy with id ${toyId} not found`)
        }

        msgToSave.id = makeId()
        msgToSave.at = Date.now()
        toy.msgs.push(msgToSave)

        await update(toy)

        return msgToSave

    } catch (err) {
        throw err
    }
}


function _saveToys() {
    return writeJsonFile('data/toy.json', toys)
}
