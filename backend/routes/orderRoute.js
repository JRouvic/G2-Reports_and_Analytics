import * as orderController from '../controllers/orderController.js';
import express from 'express';

const orderRoute = express.Router();

orderRoute.post('/',             orderController.place);

export default orderRoute;