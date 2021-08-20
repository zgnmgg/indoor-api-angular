
import sharp from 'sharp';
import fs from 'fs';
import {promisify} from 'util';
import {AppError} from '../common/error';

// To delete temp file after used
const unlinkAsync = promisify(fs.unlink);

const rootPath = `/uploads/maps`;

export interface TileParsedModel {
    path: string;
    width: number;
    height: number;
    maxZoom: number;
}

/**
 * Parses an image file into tile grids
 * @param {string} imagePath
 * @param {string} folderName
 * @return {Promise<TileParsedModel>}
 */
export default async function(
    imagePath: string,
    folderName: string): Promise<TileParsedModel> {
  const dir = `.${rootPath}/${folderName}`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});

  // Copy image in upload folder specified with folderName as base.png
  await sharp(imagePath)
      .jpeg({quality: 80, progressive: true, force: false})
      .png({compressionLevel: 8, progressive: true, force: false})
      .toFile(`${dir}/base.png`);

  // Find original width and height using metadata
  const metadata = await sharp(imagePath).metadata();
  const originalWidth = metadata.width;
  const originalHeight = metadata.height;

  if (!originalWidth || !originalHeight) {
    throw new AppError('error.unprocessable_entity.map_image_tile', 404, true);
  }

  // Calculate how much zoom is required for a default tile size (256)
  let imageWidth = originalWidth;
  let imageHeight = originalHeight;
  const defaultTileSize = 256;
  let maxZoom = 0;

  for (maxZoom; imageWidth !== 1 || imageHeight !== 1; maxZoom++) {
    const ratio = maxZoom === 0 ? 1 : 0.5;
    imageWidth = Math.round(imageWidth * ratio);
    imageHeight = Math.round(imageHeight * ratio);
  }

  imageWidth = originalWidth;
  imageHeight = originalHeight;
  maxZoom--;

  // Loop for all zooms
  for (let zoom = maxZoom; zoom >= 0; zoom--) {
    const ratio = zoom === maxZoom ? 1 : 0.5;
    imageWidth = Math.round(imageWidth * ratio);
    imageHeight = Math.round(imageHeight * ratio);

    // Calculate how much columns and rows are required at current zoom
    const maxColumns = Math.ceil(imageWidth / defaultTileSize);
    const maxRows = Math.ceil(imageHeight / defaultTileSize);

    // Resize image for current zoom and hold on buffer (not saved)
    const resizedImage = await sharp(imagePath)
        .resize(imageWidth, imageHeight)
        .toBuffer();

    // Divide current resized image into tiles
    for (let col = 0; col < maxColumns; col++) {
      // If last col width is not equal to default width, recalculate width
      const tileWidth = col !== maxColumns - 1 ?
        defaultTileSize : imageWidth - (col * defaultTileSize);

      for (let row = 0; row < maxRows; row++) {
        // If last row height is not equal to default height, recalculate height
        const tileHeight = row !== maxRows - 1 ?
          defaultTileSize : imageHeight - (row * defaultTileSize);

        // Extract tile from resized image according to current col and row
        await sharp(resizedImage)
            .resize(imageWidth, imageHeight)
            .jpeg({quality: 80, progressive: true, force: false})
            .png({compressionLevel: 8, progressive: true, force: false})
            .extract({
              left: col * defaultTileSize,
              top: row * defaultTileSize,
              width: tileWidth,
              height: tileHeight,
            })
            .toFile(`${dir}/${zoom}-${col}-${row}.png`);
      }
    }
  }

  // Delete tmp image file (not copied)
  await unlinkAsync(imagePath);

  // Return parsed image details
  return {
    path: `${rootPath}/${folderName}`,
    width: originalWidth,
    height: originalHeight,
    maxZoom: maxZoom,
  };
}
