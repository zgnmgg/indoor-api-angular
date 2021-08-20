import {Router, Request, Response} from 'express';

import {
  catchAsync,
} from '../common/error';
import {
  findChokePoints,
  upsertChokePointWithCSV,
  updateChokePointPosition,
  setChokePointMap,
  unsetChokePointMap
} from '../services';
import {setChokePoint} from '../middlewares/choke-point.middleware';
import {uploadCSVFile} from '../middlewares/upload.middleware';

// eslint-disable-next-line new-cap
const chokePointRouter = Router();

/**
 * Get all ChokePoints
 * @return {ChokePoint[]}
 */
chokePointRouter.get('',
    catchAsync(async (req: Request, res: Response) => {
      const chokePoints = await findChokePoints();
      return res.status(200).json({
        items: chokePoints,
        totalCount: chokePoints.length
      });
    }),
);

/**
 * Get all ChokePoints
 * @return {ChokePoint[]}
 */
chokePointRouter.get('/all',
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await findChokePoints());
    }),
);

/**
 * Get a ChokePoint
 * @return {ChokePoint}
 */
chokePointRouter.get('/:chokePointId',
    setChokePoint,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(req.chokePoint);
    })
);

/**
 * Create ChokePoints via CSV
 * TODO Field controls
 * @return {ChokePoint[]}
 */
chokePointRouter.post('/csv',
    uploadCSVFile,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).send(
          await upsertChokePointWithCSV(req.file?.path),
      );
    })
);

/**
 * Set a ChokePoint map
 * TODO Field controls
 * @return {ChokePoint}
 */
chokePointRouter.post('/:chokePointId/map',
    setChokePoint,
    catchAsync(async (req: Request, res: Response) => {
      const {mapId, x, y} = req.body;
      return res.status(200).json(
          await setChokePointMap(req.chokePoint?._id, mapId, x, y)
      );
    })
);

/**
 * Unset a ChokePoint map
 * @return {ChokePoint}
 */
chokePointRouter.post('/:chokePointId/unmap',
    setChokePoint,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(
          await unsetChokePointMap(req.chokePoint?._id)
      );
    })
);

/**
 * Update a ChokePoint position
 * TODO Field controls
 * @return {ChokePoint}
 */
chokePointRouter.put('/:chokePointId/position',
    setChokePoint,
    catchAsync(async (req: Request, res: Response) => {
      const {x, y} = req.body;
      return res.status(200).json(
          await updateChokePointPosition(req.chokePoint?._id, x, y)
      );
    })
);

export default chokePointRouter;
