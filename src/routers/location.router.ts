
import {Router, Request, Response} from 'express';
import {
  catchAsync,
} from '../common/error';
import {
  findLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  findChokePointsByLocation,
} from '../services';
import {setLocation} from '../middlewares/location.middleware';
const {uploadSingleImage} = require('../middlewares/upload.middleware');

// eslint-disable-next-line new-cap
const locationRouter = Router();

/**
 * Get all Locations
 * @return {Location[]}
 */
locationRouter.get('',
    catchAsync(async (req: Request, res: Response) => {
      const locations = await findLocations();
      return res.status(200).json({
        items: locations,
        totalCount: locations.length
      });
    }),
);

/**
 * Get all Locations
 * @return {Location[]}
 */
locationRouter.get('/all',
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await findLocations());
    }),
);

/**
 * Create a Location
 * After create, update asset locations (add)
 * TODO Field controls
 * @return {Location}
 */
locationRouter.post('',
    uploadSingleImage,
    catchAsync(async (req: Request, res: Response) => {
      const {name, position, chokePointIds, assetId} = req.body;
      return res.status(200).json(
          await createLocation(name, position, chokePointIds, assetId),
      );
    }),
);

/**
 * Get a Location by id
 * @return {Location}
 */
locationRouter.get('/:locationId',
    setLocation,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(req.location);
    }),
);

/**
 * Update a Location
 * After update, update locations in asset (remove, add or update)
 * After update, update location of chokePoints (update)
 * TODO Field controls
 * @return {Location}
 */
locationRouter.put('/:locationId',
    setLocation,
    uploadSingleImage,
    catchAsync(async (req: Request, res: Response) => {
      const {name, position, chokePointIds, assetId} = req.body;
      return res.status(200).json(
          await updateLocation(
            req.location!,
            name,
            position,
            chokePointIds,
            assetId,
          ),
      );
    }),
);

/**
 * Delete a Location if location includes any chokePoints
 * Before delete, update locations of asset (remove)
 * @returns {Promise<{n, deletedCount, ok}>}
 */
locationRouter.delete('/:locationId',
    setLocation,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await deleteLocation(req.location!._id));
    }),
);

/**
 * Get a Location ChokePoints by id
 * @return {ChokePoint[]}
 */
locationRouter.get('/:locationId/chokePoint',
    setLocation,
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(await findChokePointsByLocation(req.location!._id));
    }),
);

export default locationRouter;
