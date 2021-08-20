
import {
  catchAsync,
  AppError,
} from '../common/error';
import {
  findMapById,
} from '../services';
import {Request, Response, NextFunction} from 'express';

export const setMap = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      req.map = await findMapById(req.params.mapId) || undefined;
      if (!req.map) {
        return next(new AppError('error.notFound.map', 404));
      }
      next();
    },
);
