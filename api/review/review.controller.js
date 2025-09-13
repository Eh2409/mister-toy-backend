import { loggerService } from "../../services/logger.service.js"
import { reviewService } from "./review.service.js"

export async function loadReviews(req, res) {

    const filterBy = {
        toyName: req.query.toyName || '',
        minRating: +req.query.minRating || 0,
        reviewTxt: req.query.reviewTxt || '',
        byUserId: req.query.byUserId || '',
        byToyId: req.query.byToyId || '',
        sortType: req.query.sortType || 'createdAt',
        dir: +req.query.dir || -1,
        pageIdx: req.query.pageIdx
    }

    try {
        const data = await reviewService.query(filterBy)
        res.send(data)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }
}

export async function removeReview(req, res) {

    const { reviewId } = req.params

    try {
        await reviewService.remove(reviewId)
        res.send('review removed')
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}


export async function addReview(req, res) {

    const { loggedinUser } = req
    const review = req.body

    const { txt, rating, toy } = review



    if (!txt || !rating || !toy?._id || !loggedinUser) {
        return res.status(400).send('Required fields are missing')
    }

    review.user = { _id: loggedinUser?._id, username: loggedinUser?.username }

    try {
        const savedReview = await reviewService.add(review)
        const ratingStats = await reviewService.calculateRatingStats(null, toy._id)

        res.send({ savedReview, ratingStats })
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }
}


export async function updateReview(req, res) {

    const review = req.body

    const { _id, rating, txt, toy } = review

    if (!_id || !rating || !txt || !toy?._id) {
        return res.status(400).send('Required fields are missing')
    }

    try {
        const savedReview = await reviewService.update(review)
        const ratingStats = await reviewService.calculateRatingStats(null, toy._id)
        res.send({ savedReview, ratingStats })
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }
}

export async function getReviewById(req, res) {

    const { reviewId } = req.params

    try {
        const review = await reviewService.getById(reviewId)
        res.send(review)
    } catch (err) {
        loggerService.error(err)
        res.status(400).send(err)
    }

}