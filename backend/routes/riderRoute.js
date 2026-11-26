import * as riderController from '../controllers/riderController.js';
import express from 'express';

const riderRoute = express.Router();

riderRoute.get('/',                 riderController.getAll);
riderRoute.get('/free',             riderController.getFree);
riderRoute.post('/',                riderController.create);
riderRoute.put('/:id',              riderController.update);
riderRoute.patch('/:id/resign',     riderController.resign);
riderRoute.patch('/:id/reactivate', riderController.reactivate);

export default riderRoute;