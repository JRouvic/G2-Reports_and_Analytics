import * as expenseController from '../controllers/expenseController.js';
import express from 'express';

const expenseRoute = express.Router();

expenseRoute.get('/',       expenseController.getAll);
expenseRoute.post('/',      expenseController.create);
expenseRoute.delete('/:id', expenseController.remove);

export default expenseRoute;