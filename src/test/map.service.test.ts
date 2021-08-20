/* eslint-disable max-len */
import setupTestDatabase from '../shared/db-test-setup';
import AssetDoc, {Asset} from '../models/asset.model';
import MapDoc, {Map} from '../models/map.model';
import ChokePointDoc, {ChokePoint} from '../models/choke-point.model';
import {
  findMaps,
  findMapsByAsset,
  findMapById,
  findMapByIdWithThrow,
  findMapByIdAndAssetId,
  findMapByIdAndAssetIdWithThrow,
  createMap,
  updateMap,
  setMapRatio,
  deleteMap,
} from '../services';
import fs from 'fs';
import mongoose from 'mongoose';

describe('Map CRUD Service', () => {
  setupTestDatabase('indoorMap-testDb-map', ['chokePoint']);

  jest.setTimeout(50000);

  // <editor-fold desc="FIND">

  it('Find maps', async (done) => {
    const maps: Map[] = await findMaps();

    expect(maps).toBeTruthy();
    expect(maps).toHaveLength(3);

    done();
  });

  it('Find maps by asset', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const maps: Map[] = await findMapsByAsset(asset!._id);

    expect(maps).toBeTruthy();
    expect(maps).toHaveLength(1);

    done();
  });

  // noinspection DuplicatedCode
  it('Find a map by id', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const mapFound: Map | null = await findMapById(map!._id);

    expect(mapFound).toBeTruthy();
    expect(mapFound!._id).toBeTruthy();
    expect(mapFound!.name).toStrictEqual('Map1');
    expect(mapFound!.asset).toBeTruthy();
    expect(mapFound!.asset!._id).toBeTruthy();

    done();
  });

  it('Find a map by id throws', async (done) => {
    await expect(findMapByIdWithThrow(new mongoose.Types.ObjectId().toHexString()))
        .rejects.toThrow();
    await expect(findMapByIdWithThrow(new mongoose.Types.ObjectId().toHexString()))
        .rejects.toThrowError('error.notFound.map');

    done();
  });

  // noinspection DuplicatedCode
  it('Find maps by id and asset', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const mapFound: Map | null= await findMapByIdAndAssetId(map!._id, asset!._id);

    expect(mapFound).toBeTruthy();
    expect(mapFound!._id).toBeTruthy();
    expect(mapFound!.name).toStrictEqual('Map1');
    expect(mapFound!.asset).toBeTruthy();
    expect(mapFound!.asset!._id).toBeTruthy();

    const map2: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(map2).toBeTruthy();

    const mapFound2: Map | null = await findMapByIdAndAssetId(map2!._id, asset!._id);

    expect(mapFound2).not.toBeTruthy();

    done();
  });

  it('Find a map by id and asset throws', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    await expect(findMapByIdAndAssetIdWithThrow(new mongoose.Types.ObjectId().toHexString(), asset!._id))
        .rejects.toThrow();
    await expect(findMapByIdAndAssetIdWithThrow(new mongoose.Types.ObjectId().toHexString(), asset!._id))
        .rejects.toThrowError('error.notFound.map');

    done();
  });

  // </editor-fold>

  // <editor-fold desc="CREATE">

  // noinspection DuplicatedCode
  it('Create a map with asset', async (done) => {
    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();

    fs.copyFileSync(`images/ai.jpg`, `tmp/uploads/ai.jpg`);

    const map: Map = await createMap(
        'TestMap1',
        `tmp/uploads/ai.jpg`,
        asset!._id,
    );

    expect(map).toBeTruthy();
    expect(map._id).toBeTruthy();
    expect(map.name).toStrictEqual('TestMap1');
    expect(map.asset).toBeTruthy();
    expect(map.asset!._id).toStrictEqual(asset!._id);
    expect(map.path).toBeTruthy();
    expect(map.width).toBeTruthy();
    expect(map.height).toBeTruthy();
    expect(map.maxZoom).toBeTruthy();
    expect(map.chokePoints).toHaveLength(0);

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.maps.filter((m) => m.name === map.name)).toHaveLength(1);

    await fs.rmdirSync(`uploads/maps/${map._id}`, {recursive: true});

    done();
  });

  it('Create a map without asset', async (done) => {
    fs.copyFileSync(`images/ai.jpg`, `tmp/uploads/ai.jpg`);

    const map: Map = await createMap(
        'TestMap1',
        `tmp/uploads/ai.jpg`,
    );

    expect(map).toBeTruthy();
    expect(map._id).toBeTruthy();
    expect(map.name).toStrictEqual('TestMap1');
    expect(map.asset).not.toBeTruthy();
    expect(map.path).toBeTruthy();
    expect(map.width).toBeTruthy();
    expect(map.height).toBeTruthy();
    expect(map.maxZoom).toBeTruthy();
    expect(map.chokePoints).toHaveLength(0);

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.maps.filter((m) => m.name === map.name)).toHaveLength(0);

    await fs.rmdirSync(`uploads/maps/${map._id}`, {recursive: true});

    done();
  });

  // </editor-fold>

  // <editor-fold desc="UPDATE">

  // noinspection DuplicatedCode
  it('Update a map name (delete asset)', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const mapUpdated: Map = await updateMap(
      map!,
      'TestMap11',
    );

    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated._id).toBeTruthy();
    expect(mapUpdated.name).toStrictEqual('TestMap11');
    expect(mapUpdated.asset).not.toBeTruthy();
    expect(mapUpdated.path).toBeTruthy();
    expect(mapUpdated.width).toBeTruthy();
    expect(mapUpdated.height).toBeTruthy();
    expect(mapUpdated.maxZoom).toBeTruthy();

    const asset1Updated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset1Updated).toBeTruthy();
    expect(asset1Updated!.maps).toBeTruthy();
    expect(asset1Updated!.maps.filter((m) => m.name === map!.name)).toHaveLength(0);
    expect(asset1Updated!.maps.filter((m) => m.name === mapUpdated.name)).toHaveLength(0);

    const chokePointUpdated: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePointUpdated).toBeTruthy();
    expect(chokePointUpdated!.map).toBeTruthy();
    expect(chokePointUpdated!.map!.name).toStrictEqual(mapUpdated.name);

    done();
  });

  // noinspection DuplicatedCode
  it('Update a map name and asset', async (done) => {
    const asset2: Asset | null = await AssetDoc.findOne({name: 'Asset2'});
    expect(asset2).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const mapUpdated: Map = await updateMap(
            map!,
            'TestMap11',
            asset2!._id,
    );

    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated._id).toBeTruthy();
    expect(mapUpdated.name).toStrictEqual('TestMap11');
    expect(mapUpdated.asset).toBeTruthy();
    expect(mapUpdated.asset!._id).toStrictEqual(asset2!._id);
    expect(mapUpdated.path).toBeTruthy();
    expect(mapUpdated.width).toBeTruthy();
    expect(mapUpdated.height).toBeTruthy();
    expect(mapUpdated.maxZoom).toBeTruthy();

    const asset1Updated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset1Updated).toBeTruthy();
    expect(asset1Updated!.maps).toBeTruthy();
    expect(asset1Updated!.maps.filter((m) => m.name === map!.name)).toHaveLength(0);
    expect(asset1Updated!.maps.filter((m) => m.name === mapUpdated.name)).toHaveLength(0);

    const asset2Updated: Asset | null = await AssetDoc.findOne({name: 'Asset2'});
    expect(asset2Updated).toBeTruthy();
    expect(asset2Updated!.maps).toBeTruthy();
    expect(asset2Updated!.maps.filter((m) => m.name === map!.name)).toHaveLength(0);
    expect(asset2Updated!.maps.filter((m) => m.name === mapUpdated.name)).toHaveLength(1);

    const chokePointUpdated: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePointUpdated).toBeTruthy();
    expect(chokePointUpdated!.map).toBeTruthy();
    expect(chokePointUpdated!.map!.name).toStrictEqual(mapUpdated.name);

    done();
  });

  // noinspection DuplicatedCode
  it('Update a map name and imagePath (delete asset)', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    fs.copyFileSync(`images/ai.jpg`, `tmp/uploads/ai.jpg`);

    const mapUpdated: Map = await updateMap(
            map!,
            'TestMap11',
            undefined,
            `tmp/uploads/ai.jpg`,
    );

    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated._id).toBeTruthy();
    expect(mapUpdated.name).toStrictEqual('TestMap11');
    expect(mapUpdated.asset).not.toBeTruthy();
    expect(mapUpdated.path).toBeTruthy();
    expect(mapUpdated.width).toBeTruthy();
    expect(mapUpdated.height).toBeTruthy();
    expect(mapUpdated.maxZoom).toBeTruthy();

    const asset1Updated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset1Updated).toBeTruthy();
    expect(asset1Updated!.maps).toBeTruthy();
    expect(asset1Updated!.maps.filter((m) => m.name === map!.name)).toHaveLength(0);
    expect(asset1Updated!.maps.filter((m) => m.name === mapUpdated.name)).toHaveLength(0);

    const chokePointUpdated: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePointUpdated).toBeTruthy();
    expect(chokePointUpdated!.map).toBeTruthy();
    expect(chokePointUpdated!.map!.name).toStrictEqual(mapUpdated.name);

    await fs.rmdirSync(`uploads/maps/${map!._id}`, {recursive: true});

    done();
  });

  // noinspection DuplicatedCode
  it('Set a map ratio', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const mapUpdated: Map = await setMapRatio(
      map!,
      0.34
    );

    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated.ratio).toStrictEqual(0.34);

    done();
  });

  // </editor-fold>

  // <editor-fold desc="DELETE">

  it('Delete a map', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const asset: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(asset).toBeTruthy();
    expect(asset!.maps.filter((m) => m.name === map!.name)).toHaveLength(1);

    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();
    expect(chokePoint!.map).toBeTruthy();

    await expect(deleteMap(map!._id)).rejects.toThrowError('error.delete.map_chokePoint_exists');

    await MapDoc.findOneAndUpdate({_id: map!._id}, {$pull: {chokePoints: {_id: chokePoint!._id}}});
    await ChokePointDoc.deleteOne({_id: chokePoint!._id});

    const res: any = await deleteMap(map!._id);
    expect(res).toBeTruthy();
    expect(res.deletedCount).toStrictEqual(1);

    const mapDeleted: Map | null = await findMapById(map!._id);
    expect(mapDeleted).not.toBeTruthy();

    const assetUpdated: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
    expect(assetUpdated).toBeTruthy();
    expect(assetUpdated!.maps).toHaveLength(0);

    const chokePointUpdated: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePointUpdated).not.toBeTruthy();

    done();
  });

  // </editor-fold>
});
