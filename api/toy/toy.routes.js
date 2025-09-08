import express from 'express'
import { addToy, getLabels, getLabelsChartsData, getToyById, loadToys, removeToy, saveMsg, updateToy } from './toy.controller.js'


const router = express.Router()

router.get('/', loadToys)
router.delete('/:toyId', removeToy)
router.post('/', addToy)
router.put('/:toyId', updateToy)
router.get('/labels', getLabels)
router.get('/charts', getLabelsChartsData)
router.post('/:toyId/msg', saveMsg)
router.get('/:toyId', getToyById)


export const toyRoutes = router