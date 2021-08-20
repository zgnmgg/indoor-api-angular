
import AppError from '../models/app-error.model';
import {Request} from 'express';

/**
 * Handle invalid id error
 * @param {AppError} err
 * @param {Request} req
 * @return {AppError}
 */
export function handleInvalidIdError(err: AppError, req: Request) {
  const message = req.t('error.db.invalid_id');
  return new AppError(message, 400);
}

/**
 * Handle cast error
 * @param {AppError} err
 * @param {Request} req
 * @return {AppError}
 */
export function handleCastError(err: AppError, req: Request) {
  const message = req.t('error.db.cast_value', {path: err.path, value: err.value});
  return new AppError(message, 400);
}

/**
 * Handle duplicate fields error
 * @param {AppError} err
 * @param {Request} req
 * @return {AppError}
 */
export function handleDuplicateFieldsError(err: AppError, req: Request) {
  const value = err.message
      .match(/(["'])(?:(?=(\\?))\2.)*?\1/)![0]
      .toString()
      .replace(/["']/g, '');
  const message = req.t('error.db.duplicate_field', {value});
  return new AppError(message, 400);
}

/**
 * Handle validation errors
 * @param {AppError} err
 * @param {Request} req
 * @return {AppError}
 */
export function handleValidationError(err: AppError, req: Request) {
  const message: string[] = [];
  const messageDuplicates: string[] = [];
  if (err.errors) {
    Object.entries(err.errors).forEach(([key, value]) => {
      switch (value.kind) {
        case 'required':
          message.push(req.t(`error.required.${value.path}`));
          break;
        case 'unique':
          message.push(req.t(`error.unique.${value.path}`));
          break;
        case 'minlength':
          const minLength = value.properties.minlength;
          message.push(req.t(`error.minlength.${value.path}`, {minLength}));
          break;
        case 'maxlength':
          const maxLength = value.properties.maxlength;
          message.push(req.t(`error.maxlength.${value.path}`, {maxLength}));
          break;
        case 'duplicate':
          if (! messageDuplicates.some((msg) => msg === value.message)) {
            message.push(req.t(`error.duplicate.${value.message}`));
            messageDuplicates.push(value.message);
          }
          break;
        default:
          message.push(req.t(`error.${value.message}`));
          break;
      }
    });
  }

  return new AppError(message.join(' '), 404);
}
