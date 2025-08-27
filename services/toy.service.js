import { makeId, readJsonFile, writeJsonFile } from "./util.service.js"

export const toyService = {
    query,
    getById,
    remove,
    add,
    update,
    getLabels
}

const toys = readJsonFile('data/toy.json')

const PAGE_SIZE = 8

function query(filterBy = {}) {

    return Promise.resolve(toys).then(toys => {
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

    })
}


function getById(toyId) {
    const toy = toys.find(t => t._id === toyId)
    if (!toy) return Promise.reject(`cannot find toy ${toyId}`)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(t => t._id === toyId)
    if (idx === -1) return Promise.reject(`cannot find toy ${toyId}`)
    toys.splice(idx, 1)
    return _saveTodos().then(() => getMaxPage())
}

function getMaxPage() {
    return Promise.resolve(toys)
        .then(toys => Math.ceil(toys.length / PAGE_SIZE))
        .catch(err => { throw err })
}


function add(toyToSave) {

    toyToSave.createdAt = Date.now()
    toyToSave._id = makeId()

    toys.unshift(toyToSave)

    return _saveTodos().then(() => toyToSave)
}

function update(toyToSave) {

    const idx = toys.findIndex(t => t._id === toyToSave._id)
    if (idx === -1) return Promise.reject(`cannot find toy ${toyToSave._id}`)

    toys[idx] = { ...toys[idx], ...toyToSave }

    const savedToy = toys[idx]

    return _saveTodos().then(() => savedToy)
}


function getLabels() {

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

    return Promise.resolve({ brands, productTypes, companies })
}


function _saveTodos() {
    return writeJsonFile('data/toy.json', toys)
}
