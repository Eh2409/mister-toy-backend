import express from 'express'
import { addReview, getReviewById, loadReviews, removeReview, updateReview } from './review.controller.js'
import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'

const router = express.Router()

router.get('/', loadReviews)
router.delete('/:reviewId', requireAuth, requireAdmin, removeReview)
router.post('/', requireAuth, addReview)
router.put('/:reviewId', requireAuth, requireAdmin, updateReview)
router.get('/:reviewId', getReviewById)

export const reviewRoutes = router