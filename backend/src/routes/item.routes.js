import { Router } from 'express'
import { getAll, getOne, create, update, remove } from '../controllers/item.controller.js'

const router = Router()

// RESTful convention
router.get('/', getAll)        // GET    /api/items
router.get('/:id', getOne)     // GET    /api/items/:id
router.post('/', create)       // POST   /api/items
router.put('/:id', update)     // PUT    /api/items/:id
router.delete('/:id', remove)  // DELETE /api/items/:id

export default router
