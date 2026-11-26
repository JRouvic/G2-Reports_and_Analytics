import * as promoController from '../controllers/promoController.js';
import express from 'express';

const promoRoute = express.Router();

 promoRoute.get('/',          promoController.getAll);
 promoRoute.post('/',         promoController.create);
 promoRoute.post('/validate', promoController.validate);
 promoRoute.patch('/:code',   promoController.toggle);
 promoRoute.delete('/:code',  promoController.remove);

export default promoRoute;