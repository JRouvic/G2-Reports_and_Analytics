import * as promoController from '../controllers/promoController.js';
import express from 'express';

const promoRoute = express.Router();

promoRoute.post('/',         promoController.create);

export default promoRoute;