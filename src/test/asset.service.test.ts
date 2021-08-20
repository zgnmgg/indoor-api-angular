/* eslint-disable max-len */
import setupTestDatabase from '../shared/db-test-setup';
import AssetDoc, {Asset} from '../models/asset.model';
import MapDoc, {Map} from '../models/map.model';
import {
  findAssets,
  findAssetById,
  findAssetByIdWithThrow,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../services';
import mongoose from 'mongoose';

describe('Asset CRUD Service', () => {
  setupTestDatabase('indoorMap-testDb-asset', ['map']);

  jest.setTimeout(50000);

  // <editor-fold desc="FIND">

  it('Find assets', async (done) => {
    const assets: Asset[] = await findAssets();

    expect(assets).toBeTruthy();
    expect(assets).toHaveLength(3);

    done();
  });

  it('Find an asset by id', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const assetFound: Asset | null = await findAssetById(asset!._id);

    expect(assetFound).toBeTruthy();
    expect(assetFound!._id).toBeTruthy();
    expect(assetFound!.name).toStrictEqual('Asset1');
    expect(assetFound!.maps).toHaveLength(1);

    done();
  });

  it('Find an asset by id throws', async (done) => {
    await expect(findAssetByIdWithThrow(new mongoose.Types.ObjectId().toHexString()))
        .rejects.toThrow();
    await expect(findAssetByIdWithThrow(new mongoose.Types.ObjectId().toHexString()))
        .rejects.toThrowError('error.notFound.asset');

    done();
  });

  // </editor-fold>

  // <editor-fold desc="CREATE">

  it('Create an asset', async (done) => {
    const asset: Asset = await createAsset(
        'TestAsset1',
    );

    expect(asset).toBeTruthy();
    expect(asset._id).toBeTruthy();
    expect(asset.name).toStrictEqual('TestAsset1');
    expect(asset.maps).toHaveLength(0);

    done();
  });

  // </editor-fold>

  // <editor-fold desc="UPDATE">

  it('Update an asset', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const assetUpdated: Asset = await updateAsset(
            asset!,
            'TestAsset2',
    );

    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated._id).toBeTruthy();
    expect(assetUpdated!.name).toStrictEqual('TestAsset2');
    expect(assetUpdated!.maps).toHaveLength(1);

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();
    expect(map!.asset).toBeTruthy();
    expect(map!.asset!.name).toStrictEqual(assetUpdated!.name);

    done();
  });

  // </editor-fold>

  // <editor-fold desc="DELETE">

  it('Delete an asset', async (done) => {
    const asset = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();
    expect(map!.asset).toBeTruthy();

    await expect(deleteAsset(map!._id)).rejects.toThrow();

    await AssetDoc.findOneAndUpdate(
        {_id: asset!._id},
        {
          $pull: {
            maps: {_id: map!._id}
          },
        },
    );
    await MapDoc.deleteOne({_id: map!._id});

    const res: any = await deleteAsset(asset!._id);
    expect(res).toBeTruthy();
    expect(res.deletedCount).toStrictEqual(1);

    const assetDeleted: Asset | null = await findAssetById(map!._id);
    expect(assetDeleted).not.toBeTruthy();

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).not.toBeTruthy();

    done();
  });

  // </editor-fold>
});
