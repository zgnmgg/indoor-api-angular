
import {
  catchAsync,
  AppError,
} from '../common/error';
import {
  findChokePointById,
} from '../services';
import {Request, Response, NextFunction} from 'express';

export const setChokePoint = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      req.chokePoint = await findChokePointById(req.params.chokePointId) || undefined;
      if (!req.chokePoint) {
        return next(new AppError('error.notFound.chokePoint', 404));
      }
      next();
    },
);
