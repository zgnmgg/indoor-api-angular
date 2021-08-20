/**
 * AppError class to handle all errors thrown in app
 */
export default class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    needTranslate: boolean;
    translateObject: { [key: string]: string } | undefined;

    code?: number;
    path?: string;
    kind?: string;
    value?: string;
    errors?: any[];
    _message?: string[];

    /**
     * @param {string} message: Error Message
     * @param {number} statusCode
     * @param {boolean} needTranslate
     * @param {Object} translateObject
     */
    constructor(
        message: string,
        statusCode: number,
        needTranslate: boolean = false,
        translateObject?: { [key: string]: string }) {
      super(message);

      this.name = 'AppError';
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      this.needTranslate = needTranslate;
      this.translateObject = translateObject;

      Error.captureStackTrace(this, this.constructor);
    }
}
