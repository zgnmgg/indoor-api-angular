
import {Router, Request, Response} from 'express';
import {
  AppError,
  catchAsync,
} from '../common/error';
import {
  findMaps,
  createMap,
  updateMap,
  setMapRatio,
  deleteMap,
  findChokePointsByMap,
  updateChokePointPosition,
} from '../services';
import {setMap} from '../middlewares/map.middleware';
import {setChokePoint} from '../middlewares/choke-point.middleware';
const {uploadSingleImage} = require('../middlewares/upload.middleware');

// eslint-disable-next-line new-cap
const mapRouter = Router();

/**
 * Get all Maps
 * @return {Map[]}
 */
mapRouter.get('',
    catchAsync(async (req: Request, res: Response) => {
      const maps = await findMaps();
      return res.status(200).json({
        items: maps,
        totalCount: maps.length
      });
    }),
);

/**
 * Get all Maps
 * @return {Map[]}
 */
mapRouter.get('/all',
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await findMaps());
    }),
);

/**
 * Create a Map
 * If image exists, update after image parsing
 * After create, update asset maps (add)
 * TODO Field controls
 * @return {Map}
 */
mapRouter.post('',
    uploadSingleImage,
    catchAsync(async (req: Request, res: Response) => {
      if (! req.file) {
        throw new AppError('error.missing_parameter.image', 404, true);
      }
      const {name, assetId} = req.body;
      return res.status(200).json(
          await createMap(name, req.file.path, assetId),
      );
    }),
);

/**
 * Get a Map by id
 * @return {Map}
 */
mapRouter.get('/:mapId',
    setMap,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(req.map);
    }),
);

/**
 * Update a Map
 * After update, update maps in asset (remove, add or update)
 * After update, update map of chokePoints (update)
 * TODO Field controls
 * @return {Map}
 */
mapRouter.put('/:mapId',
    setMap,
    uploadSingleImage,
    catchAsync(async (req: Request, res: Response) => {
      const {name, assetId} = req.body;
      return res.status(200).json(
          await updateMap(
            req.map!,
            name,
            assetId,
            req.file ? req.file.path : undefined,
          ),
      );
    }),
);

/**
 * Set a Map ratio
 * TODO Field controls
 * @return {Map}
 */
mapRouter.put('/:mapId/ratio',
    setMap,
    catchAsync(async (req: Request, res: Response) => {
      const {ratio} = req.body;
      return res.status(200).json(
          await setMapRatio(
            req.map!,
            ratio
          )
      );
    }),
);

/**
 * Delete a Map if map includes any chokePoints
 * Before delete, update maps of asset (remove)
 * @returns {Promise<{n, deletedCount, ok}>}
 */
mapRouter.delete('/:mapId',
    setMap,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await deleteMap(req.map!._id));
    }),
);

/**
 * Get a Map ChokePoints by id
 * @return {ChokePoint[]}
 */
mapRouter.get('/:mapId/chokePoint',
    setMap,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await findChokePointsByMap(req.map!._id));
    }),
);

/**
 * Update a Map chokePoint position
 * If chokepoint map and request map is not match throw error
 * If given positions do not fit into map, throw error
 * TODO Field controls
 * @return {Map}
 */
mapRouter.put('/:mapId/chokePoint/:chokePointId/position',
    setMap,
    setChokePoint,
    catchAsync(async (req: Request, res: Response) => {
      // eslint-disable-next-line max-len
      if (! (req.map && req.chokePoint && req.chokePoint.map && req.chokePoint.map._id.equals(req.map._id))) {
        throw new AppError('error.notFound.chokePoint', 404, true);
      }

      const {x, y} = req.body;

      if (!req.map.width || !req.map.height ||
        x < 0 || y < 0 ||
        x > req.map.width || y > req.map.height) {
        throw new AppError('error.unprocessable_entity.map_position_not_fit', 422, true);
      }

      return res.status(200).json(await updateChokePointPosition(
          req.chokePoint._id,
          x,
          y,
      ));
    }),
);

export default mapRouter;
