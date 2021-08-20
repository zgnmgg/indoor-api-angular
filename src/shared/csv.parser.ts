import fs from 'fs';
import csv from 'csv-parser';
import AppError from '../common/error/models/app-error.model';
import {promisify} from 'util';

// To delete temp file after used
const unlinkAsync = promisify(fs.unlink);

/**
 * Parses an csv file and return row of objects type T
 * @param {string} csvPath
 * @return {Promise<[]>}
 */
export default async function <T>(
    csvPath: string
): Promise<T[]> {
  const documents: T[] = [];

  return new Promise<T[]>((resolve) => {
    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', async (row)=> {
          documents.push(row as T);
        })
        .on('end', async ()=> {
          await unlinkAsync(csvPath);
          resolve(documents);
        });
  }).catch((e) => {
    throw new AppError(e, 404, true);
  });
}
