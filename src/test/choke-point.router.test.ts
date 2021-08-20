/* eslint-disable max-len */
import supertest, {Response} from 'supertest';
import app from '../app';
import fs from 'mz/fs';
import setupTestDatabase from '../shared/db-test-setup';
import MapDoc, {Map} from '../models/map.model';
import ChokePointDoc, {ChokePoint} from '../models/choke-point.model';

const request = supertest(app);

describe('ChokePoint CRUD API', () => {
  setupTestDatabase('indoorMap-testDb-chokePoint', ['chokePoint']);

  jest.setTimeout(50000);

  it('GET /api/chokePoint - get all chokePoints', async (done) => {
    const res: Response = await request
        .get('/api/chokePoint')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);

    done();
  });

  it('GET /api/chokePoint/:id - get a chokePoint', async (done) => {
    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const res: Response = await request
        .get(`/api/chokePoint/${chokePoint!._id}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body._id).toBeTruthy();
    expect(res.body.name).toStrictEqual('ChokePoint1');

    done();
  });

  it('POST /api/chokePoint/csv - create chokePoints via CSV', async (done) => {
    const filePath = `files/chokepoints.csv`;
    if (! (await fs.exists(filePath))) throw new Error('file does not exists!');

    const res: Response = await request
        .post('/api/chokePoint/csv')
        .set('Accept', 'application/json')
        .attach('csv', filePath);

    expect(res.status).toBe(200);
    const chokePoints: ChokePoint[] = res.body;

    expect(chokePoints).toBeTruthy();
    expect(chokePoints).toHaveLength(3);
    expect(chokePoints.find((c) => c.name === 'CSV ChokePoint 1')).toBeTruthy();
    expect(chokePoints.find((c) => c.name === 'CSV ChokePoint 2')).toBeTruthy();
    expect(chokePoints.find((c) => c.name === 'CSV ChokePoint 3')).toBeTruthy();
    expect(chokePoints.find((c) => c.name === 'CSV ChokePoint 4')).not.toBeTruthy();

    done();
  });

  // noinspection DuplicatedCode
  it('POST /api/chokePoint/:id/map - set a chokePoint map', async (done) => {
    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(map).toBeTruthy();

    const res: Response = await request
        .post(`/api/chokePoint/${chokePoint!._id}/map`)
        .send({
          mapId: map!._id,
          x: 531,
          y: 432
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    const chokePointSet: ChokePoint = res.body;

    expect(chokePointSet).toBeTruthy();
    expect(chokePointSet._id).toBeTruthy();
    expect(chokePointSet.name).toStrictEqual(chokePoint!.name);
    expect(chokePointSet.map).toBeTruthy();
    expect(chokePointSet.map!.name).toStrictEqual(map!.name);
    expect(chokePointSet.x).toStrictEqual(531);
    expect(chokePointSet.y).toStrictEqual(432);

    const mapOld: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapOld).toBeTruthy();
    expect(mapOld!.chokePoints.filter((c) => c.name === chokePointSet!.name)).toHaveLength(0);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.chokePoints.filter((c) => c.name === chokePointSet!.name)).toHaveLength(1);

    done();
  });

  // noinspection DuplicatedCode
  it('POST /api/chokePoint/:id/unmap - unset a chokePoint map', async (done) => {
    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    // Set map
    const res1: Response = await request
        .post(`/api/chokePoint/${chokePoint!._id}/map`)
        .send({
          mapId: map!._id,
          x: 531,
          y: 432
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res1.status).toBe(200);
    const chokePointSet1: ChokePoint = res1.body;

    expect(chokePointSet1).toBeTruthy();
    expect(chokePointSet1._id).toBeTruthy();
    expect(chokePointSet1.name).toStrictEqual(chokePoint!.name);
    expect(chokePointSet1.map).toBeTruthy();
    expect(chokePointSet1.map!.name).toStrictEqual(map!.name);
    expect(chokePointSet1.x).toStrictEqual(531);
    expect(chokePointSet1.y).toStrictEqual(432);

    // Unset map
    const res: Response = await request
        .post(`/api/chokePoint/${chokePoint!._id}/unmap`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    const chokePointSet2: ChokePoint = res.body;

    expect(chokePointSet2).toBeTruthy();
    expect(chokePointSet2._id).toBeTruthy();
    expect(chokePointSet2.name).toStrictEqual(chokePoint!.name);
    expect(chokePointSet2.map).not.toBeTruthy();
    expect(chokePointSet2.x).not.toBeTruthy();
    expect(chokePointSet2.y).not.toBeTruthy();

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.chokePoints.filter((c) => c.name === chokePointSet2!.name)).toHaveLength(0);

    done();
  });

  it('PUT /api/chokePoint/:id - update a chokePoint position', async (done) => {
    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const res: Response = await request
        .put(`/api/chokePoint/${chokePoint!._id}/position`)
        .send({x: 531, y: 432})
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    const chokePointUpdated: ChokePoint = res.body;

    expect(chokePointUpdated).toBeTruthy();
    expect(chokePointUpdated._id).toBeTruthy();
    expect(chokePointUpdated.x).toStrictEqual(531);
    expect(chokePointUpdated.y).toStrictEqual(432);

    done();
  });
});
