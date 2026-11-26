import * as orderController from '../controllers/orderController.js';
import express from 'express';

const orderRoute = express.Router();

orderRoute.get('/',              orderController.getAll);
orderRoute.get('/mine',          orderController.getMine);
orderRoute.post('/',             orderController.place);
orderRoute.patch('/:id/accept',  orderController.accept);
orderRoute.patch('/:id/decline', orderController.decline);

export default orderRoute;