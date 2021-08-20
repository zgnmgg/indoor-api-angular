/* eslint-disable max-len */
import setupTestDatabase from '../shared/db-test-setup';
import AssetDoc, {Asset} from '../models/asset.model';
import MapDoc, {Map} from '../models/map.model';
import supertest, {Response} from 'supertest';
import app from '../app';
import fs from 'mz/fs';

const request = supertest(app);

describe('Map CRUD API / Image Layer Parsing', () => {
  setupTestDatabase('indoorMap-testDb-map', ['map']);

  jest.setTimeout(50000);

  it('GET /api/map - get all maps', async (done) => {
    const res: Response = await request
        .get('/api/map');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(3);

    done();
  });

  it('GET /api/map/:id - get a map', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});

    const res: Response = await request
        .get(`/api/map/${map!._id}`);

    expect(res.status).toBe(200);
    expect(res.body._id.toString()).toStrictEqual(map!._id.toString());
    expect(res.body.name).toStrictEqual('Map1');

    done();
  });

  it('POST /api/map - create a map', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const filePath = `images/ai.jpg`;
    if (! (await fs.exists(filePath))) throw new Error('file does not exists!');

    const res: Response = await request
        .post('/api/map')
        .attach('image', filePath)
        .field({
          name: 'TestMap1',
          assetId: asset!._id.toString(),
        });

    expect(res.status).toBe(200);
    const map: Map = res.body;

    expect(map._id).toBeTruthy();
    expect(map.name).toStrictEqual('TestMap1');
    expect(map.path).toBeTruthy();
    expect(map.width).toBeTruthy();
    expect(map.height).toBeTruthy();
    expect(map.maxZoom).toBeTruthy();
    expect(map.chokePoints).toHaveLength(0);

    await fs.rmdirSync(`uploads/maps/${map._id}`, {recursive: true});

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.maps.filter((m) => m.name === map.name)).toHaveLength(1);

    done();
  });

  it('POST /api/map - create map without an image', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    await request
        .post('/api/map')
        .field({
          name: 'TestMap1',
          assetId: asset!._id.toString(),
        })
        .expect(404);

    done();
  });

  // noinspection DuplicatedCode
  it('PUT /api/map/:id - update a map name, imagePath, and asset', async (done) => {
    const map1: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map1).toBeTruthy();

    const asset2: Asset | null = await AssetDoc.findOne({name: 'Asset2'});
    expect(asset2).toBeTruthy();

    const filePath = `images/frog.png`;
    if (! (await fs.exists(filePath))) throw new Error('file does not exists!');

    const res: Response = await request
        .put(`/api/map/${map1!._id}`)
        .attach('image', filePath)
        .field({
          name: 'TestMap1',
          assetId: asset2!._id.toString(),
        });

    expect(res.status).toBe(200);
    const map1Updated: Map = res.body;

    expect(map1Updated._id.toString()).toStrictEqual(map1!._id.toString());
    expect(map1Updated.name).toStrictEqual('TestMap1');
    expect(map1Updated.path).toBeTruthy();
    expect(map1Updated.width).toBeTruthy();
    expect(map1Updated.height).toBeTruthy();
    expect(map1Updated.maxZoom).toBeTruthy();
    expect(map1Updated.chokePoints).toHaveLength(0);
    expect(map1Updated.asset).toBeTruthy();
    expect(map1Updated.asset!._id.toString()).toStrictEqual(asset2!._id.toString());

    const asset1Updated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset1Updated).toBeTruthy();
    expect(asset1Updated!.maps.filter((m) => m.name === map1!.name)).toHaveLength(0);
    expect(asset1Updated!.maps.filter((m) => m.name === map1Updated.name)).toHaveLength(0);

    const asset2Updated: Asset | null = await AssetDoc.findOne({name: 'Asset2'});
    expect(asset2Updated).toBeTruthy();
    expect(asset2Updated!.maps.filter((m) => m.name === map1!.name)).toHaveLength(0);
    expect(asset2Updated!.maps.filter((m) => m.name === map1Updated.name)).toHaveLength(1);

    await fs.rmdirSync(`uploads/maps/${res.body._id}`, {recursive: true});

    done();
  });

  it('PUT /api/map/:id - update a map ratio', async (done) => {
    const map1: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map1).toBeTruthy();

    const res: Response = await request
        .put(`/api/map/${map1!._id}/ratio`)
        .send({
          ratio: 0.5647345
        });

    expect(res.status).toBe(200);
    const map1Updated: Map = res.body;

    expect(map1Updated._id.toString()).toStrictEqual(map1!._id.toString());
    expect(map1Updated.ratio).toStrictEqual(0.5647345);

    done();
  });

  it('DELETE /api/map/:id - delete a map', async (done) => {
    const map = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const asset = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();
    expect(asset!.maps.filter((m) => m.name === map!.name)).toHaveLength(1);

    const res: Response = await request
        .delete(`/api/map/${map!._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeTruthy();
    expect(res.body.deletedCount).toStrictEqual(1);

    const assetUpdated = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated!.maps.filter((m) => m.name === map!.name)).toHaveLength(0);

    done();
  });
});
