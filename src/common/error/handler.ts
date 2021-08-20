import AppError from './models/app-error.model';
import {Request, Response, NextFunction} from 'express';
import {
  handleInvalidIdError,
  handleCastError,
  handleDuplicateFieldsError,
  handleValidationError,
} from './handlers/mongoose';
import logger from '../logger';

/**
 * Return error model for dev environment
 * @param {AppError} err
 * @param {Request} req
 * @param {Response} res
 */
const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    time: new Date(),
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Return error model for prod environment
 * @param {AppError} err
 * @param {Request} req
 * @param {Response} res
 */
const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      time: new Date(),
      message: err.message,
    });
  } else {
    logger.error(`ERROR 💥`, {err: err, pid: process.pid});

    res.status(500).json({
      status: 'error',
      time: new Date(),
      message: req.t('error.general.bad_request')
    });
  }
};

/* eslint-disable max-len */
/**
 * Error handler
 * @param {AppError} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export default function(
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'prod') {
    let error = {...err};
    error.message = err.message;
    error.name = err.name;

    if (error.kind === 'ObjectId') error = handleInvalidIdError(error, req);
    else if (error.name === 'CastError') error = handleCastError(error, req);
    else if (error.name === 'MongoError' && error.code === 11000) error = handleDuplicateFieldsError(error, req);
    else if (error.name === 'ValidationError') error = handleValidationError(error, req);
    else if (error._message && error._message.includes('validation')) error = handleValidationError(error, req);
    else {
      if (error.needTranslate) error.message = req.t(error.message, error.translateObject);
    }

    sendErrorProd(error, req, res);
  } else {
    sendErrorDev(err, req, res);
  }
};
