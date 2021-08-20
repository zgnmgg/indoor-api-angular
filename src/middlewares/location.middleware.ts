
import {
  catchAsync,
  AppError,
} from '../common/error';
import {
  findLocationById,
} from '../services';
import {Request, Response, NextFunction} from 'express';

export const setLocation = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      req.location = await findLocationById(req.params.locationId) || undefined;
      if (!req.location) {
        return next(new AppError('error.notFound.location', 404));
      }
      next();
    },
);
