
import { ObjectId } from "mongodb"
import { dbService } from "../../services/db.service.js"

export const reviewService = {
    query,
    getById,
    remove,
    add,
    update,
    calculateRatingStats
}


const PAGE_SIZE = 8

async function query(filterBy = {}) {
    try {
        const limit = filterBy.pageIdx !== undefined ? PAGE_SIZE : 0

        const { criteria, sort, skip } = _buildCriteria(filterBy)

        const collection = await dbService.getCollection('review')

        const reviews = await collection.aggregate([
            { $match: criteria },

            {
                $addFields: {
                    toyObjId: { $toObjectId: '$toyId' },
                    userObjId: { $toObjectId: '$userId' }
                }
            },
            {
                $lookup: {
                    from: 'toy',
                    localField: 'toyObjId',
                    foreignField: '_id',
                    as: 'toy'
                }
            },
            { $unwind: '$toy' },

            ...(filterBy.toyName
                ? [{ $match: { "toy.name": { $regex: filterBy.toyName, $options: "i" } } }]
                : []),

            {
                $lookup: {
                    from: 'user',
                    localField: 'userObjId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $addFields: {
                    createdAt: { $toLong: { $toDate: '$_id' } }
                }
            },


            {
                $project: {
                    _id: 1,
                    txt: 1,
                    'toy._id': 1,
                    'toy.name': 1,
                    'user.username': 1,
                    'user._id': 1,
                    createdAt: 1,
                    rating: 1
                }
            },

            { $sort: sort || { _id: -1 } },

            { $skip: skip },

            ...(limit ? [{ $limit: limit }] : []),

        ]).toArray()

        const ratingStats = filterBy.byToyId && reviews?.length > 0 ? await calculateRatingStats(reviews) : {}

        const totalToys = await collection.countDocuments(criteria)
        const maxPageCount = Math.ceil(totalToys / PAGE_SIZE)

        return { reviews, ratingStats, maxPageCount }

    } catch (err) {
        throw err
    }
}


async function getById(reviewId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(reviewId) }
        const collection = await dbService.getCollection('review')

        const review = await collection.aggregate([
            { $match: criteria },

            {
                $addFields: {
                    toyObjId: { $toObjectId: '$toyId' },
                    userObjId: { $toObjectId: '$userId' }
                }
            },
            {
                $lookup: {
                    from: 'toy',
                    localField: 'toyObjId',
                    foreignField: '_id',
                    as: 'toy'
                }
            },
            { $unwind: '$toy' },
            {
                $lookup: {
                    from: 'user',
                    localField: 'userObjId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },

            {
                $addFields: {
                    createdAt: { $toLong: { $toDate: '$_id' } }
                }
            },

            {
                $project: {
                    _id: 1,
                    txt: 1,
                    'toy._id': 1,
                    'toy.name': 1,
                    'user.username': 1,
                    'user._id': 1,
                    createdAt: 1,
                    rating: 1
                }
            },

        ]).toArray()

        return review[0] || null
    } catch (err) {
        throw err
    }
}

async function remove(reviewId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(reviewId) }
        const collection = await dbService.getCollection('review')
        await collection.deleteOne(criteria)
        return
    } catch (err) {
        throw err
    }
}

async function add(review) {

    const reviewToSave = {
        userId: review?.user?._id,
        toyId: review?.toy?._id,
        txt: review?.txt,
        rating: review?.rating
    }

    try {
        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToSave)

        review._id = reviewToSave?._id
        review.createdAt = reviewToSave?._id.getTimestamp().getTime()

        return review
    } catch (err) {
        throw err
    }
}

async function update(review) {
    const { _id, txt, rating } = review
    const reviewToSave = { txt, rating }
    const reviewId = _id

    try {
        const criteria = { _id: ObjectId.createFromHexString(reviewId) }
        const collection = await dbService.getCollection('review')
        await collection.updateOne(criteria, { $set: reviewToSave })
        return review
    } catch (err) {
        throw err
    }
}

async function calculateRatingStats(reviews, toyId = undefined) {

    if (!reviews?.length && !toyId) return {
        ratingSum: 0,
        reviewsLength: 0,
        reviewPercentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }

    if (!reviews?.length) {
        const collection = await dbService.getCollection('review')
        var reviews = await collection.find({ toyId: toyId }).toArray()
    }

    // sum rating 
    var ratingSum = reviews.reduce((acc, r) => {
        acc += r.rating
        return acc
    }, 0)

    ratingSum = parseFloat((ratingSum / reviews.length).toFixed(1))

    // review percentages
    const ratingCounts = reviews.reduce((acc, r) => {
        acc[r.rating]++
        return acc
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })

    for (const [rating, count] of Object.entries(ratingCounts)) {

        ratingCounts[rating] = parseFloat(((count / reviews.length) * 100).toFixed(1))
    }


    return {
        ratingSum,
        reviewsLength: reviews.length,
        reviewPercentages: ratingCounts
    }
}

function _buildCriteria(filterBy = {}) {
    const criteria = {}

    if (filterBy.byUserId) {
        criteria['userId'] = filterBy.byUserId
    }

    if (filterBy.byToyId) {
        criteria['toyId'] = filterBy.byToyId + ''
    }

    // if (filterBy.toyName) {
    //     criteria['name'] = { $regex: filterBy.toyName, $options: 'i' }
    // }

    if (filterBy.minRating) {
        criteria['rating'] = { $gte: filterBy.minRating }
    }

    if (filterBy.reviewTxt) {
        criteria['txt'] = { $regex: filterBy.reviewTxt, $options: 'i' }
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
