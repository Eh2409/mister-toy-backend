import express from 'express'
import { addToy, getLabels, getLabelsChartsData, getToyById, loadToys, removeMsg, removeToy, saveMsg, updateToy } from './toy.controller.js'
import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'


const router = express.Router()

router.get('/', loadToys)
router.delete('/:toyId', requireAuth, requireAdmin, removeToy)
router.post('/', requireAuth, requireAdmin, addToy)
router.put('/:toyId', requireAuth, requireAdmin, updateToy)
router.get('/labels', getLabels)
router.get('/charts', getLabelsChartsData)
router.post('/:toyId/msg', requireAuth, saveMsg)
router.delete('/:toyId/msg/:msgId', requireAuth, requireAdmin, removeMsg)
router.get('/:toyId', getToyById)


export const toyRoutes = router