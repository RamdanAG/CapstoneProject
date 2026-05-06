import { Router } from 'express'
import { getAll_, getOne, create, updateItem, removeItem } from '../controllers/item.controller.js'

const router = Router()

router.get('/',     getAll_)
router.get('/:id',  getOne)
router.post('/',    create)
router.put('/:id',  updateItem)
router.delete('/:id', removeItem)

export default router
