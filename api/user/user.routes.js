import express from 'express'
import { getUserById, loadUsers, removeUser, updateUser } from './user.controller.js'

const router = express.Router()

router.get('/', loadUsers)
router.delete('/:userId', removeUser)
router.put('/:userId', updateUser)
router.get('/:userId', getUserById)

export const userRoutes = router