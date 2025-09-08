import express from 'express'
import { getUserById, loadUsers, removeUser, updateUser } from './user.controller.js'
import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'

const router = express.Router()

router.get('/', loadUsers)
router.delete('/:userId', requireAuth, requireAdmin, removeUser)
router.put('/:userId', requireAuth, updateUser)
router.get('/:userId', getUserById)

export const userRoutes = router