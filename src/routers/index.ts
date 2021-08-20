import express, {Router} from 'express';
import assetRouter from './asset.router';
import mapRouter from './map.router';
import chokePointRouter from './choke-point.router';
import locationRouter from './location.router';

// eslint-disable-next-line new-cap
const routes = Router();

routes.use('/api/asset', assetRouter);
routes.use('/api/map', mapRouter);
routes.use('/api/chokePoint', chokePointRouter);
routes.use('/api/location', locationRouter);
routes.use('/api/uploads', express.static('./uploads'));

export default routes;
