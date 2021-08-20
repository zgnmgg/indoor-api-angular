
import imageTileParser from './../shared/image-tile.parser';
import fs from 'mz/fs';

describe('Image Tile Parsing', () => {
  it('Parse an image', async (done) => {
    fs.copyFileSync(`images/ai.jpg`, `tmp/uploads/ai.jpg`);

    const res = await imageTileParser(
        `tmp/uploads/ai.jpg`,
        'test',
    );

    expect(res.path).toBeTruthy();
    expect(res.width).toBeTruthy();
    expect(res.height).toBeTruthy();
    expect(res.maxZoom).toBeTruthy();

    // TODO Check folder exists

    // Delete temp file
    await fs.rmdirSync(res.path, {recursive: true});

    done();
  });
});
