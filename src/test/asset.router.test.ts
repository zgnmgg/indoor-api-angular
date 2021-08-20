/* eslint-disable max-len */
import setupTestDatabase from '../shared/db-test-setup';
import AssetDoc, {Asset} from '../models/asset.model';
import supertest, {Response} from 'supertest';
import app from '../app';

const request = supertest(app);

describe('Asset CRUD API', () => {
  setupTestDatabase('indoorMap-testDb-asset', ['asset']);

  jest.setTimeout(50000);

  it('GET /api/asset - get all assets', async (done) => {
    const res: Response = await request
        .get('/api/asset')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);

    done();
  });

  it('POST /api/asset - create an asset', async (done) => {
    const res: Response = await request
        .post('/api/asset')
        .send({name: 'Flip'})
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body._id).toBeTruthy();
    expect(res.body.name).toStrictEqual('Flip');

    done();
  });

  it('GET /api/asset/:id - get an asset', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const res: Response = await request
        .get(`/api/asset/${asset!._id}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body._id).toBeTruthy();
    expect(res.body.name).toStrictEqual('Asset1');

    done();
  });

  it('PUT /api/asset/:id - update an asset', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const res: Response = await request
        .put(`/api/asset/${asset!._id}`)
        .send({name: 'Flop'})
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body._id).toBeTruthy();
    expect(res.body.name).toStrictEqual('Flop');

    done();
  });

  it('DELETE /api/asset/:id - delete an asset', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const res: Response = await request
        .delete(`/api/asset/${asset!._id}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toBeTruthy();
    expect(res.body.deletedCount).toStrictEqual(1);

    done();
  });
});
