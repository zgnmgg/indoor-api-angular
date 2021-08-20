/* eslint-disable max-len */
import setupTestDatabase from '../shared/db-test-setup';
import MapDoc, {Map} from '../models/map.model';
import ChokePointDoc, {ChokePoint} from '../models/choke-point.model';
import supertest, {Response} from 'supertest';
import app from '../app';

const request = supertest(app);

describe('Map ChokePoint API', () => {
  setupTestDatabase('indoorMap-testDb-map', ['chokePoint']);

  jest.setTimeout(50000);

  it('GET /api/map/:id/chokePoint - get a map chokePoints', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});

    const res: Response = await request
        .get(`/api/map/${map!._id}/chokePoint`);

    expect(res.status).toBe(200);
    const chokePoints: ChokePoint[] = res.body;

    expect(chokePoints).toHaveLength(1);
    expect(chokePoints.find((c) => c.name === 'ChokePoint1')).toBeTruthy();

    done();
  });

  it('PUT /api/map/:id/chokePoint - update a map chokePoint position', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const res: Response = await request
        .put(`/api/map/${map!._id}/chokePoint/${chokePoint!._id}/position`)
        .send({
          x: 1001,
          y: 901
        });

    expect(res.status).toBe(200);
    const chokePointUpdated: ChokePoint = res.body;

    expect(chokePointUpdated).toBeTruthy();
    expect(chokePointUpdated!._id).toBeTruthy();
    expect(chokePointUpdated!.name).toBeTruthy();
    expect(chokePointUpdated!.macAddress).toBeTruthy();
    expect(chokePointUpdated!.map).toBeTruthy();
    expect(chokePointUpdated!.x).toStrictEqual(1001);
    expect(chokePointUpdated!.y).toStrictEqual(901);

    done();
  });

  it('PUT /api/map/:id/chokePoint - update a map chokePoint that not include specified map', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint2'});
    expect(chokePoint).toBeTruthy();

    const res: Response = await request
        .put(`/api/map/${map!._id}/chokePoint/${chokePoint!._id}/position`)
        .send({
          x: 1001,
          y: 901
        });

    expect(res.status).toBe(404);

    done();
  });

  it('PUT /api/map/:id/chokePoint - update a map chokePoint with non fit positions', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const res: Response = await request
        .put(`/api/map/${map!._id}/chokePoint/${chokePoint!._id}/position`)
        .send({
          x: 544359,
          y: 542345
        });

    expect(res.status).toBe(422);

    done();
  });
});
