/* eslint-disable max-len */
import setupTestDatabase from '../shared/db-test-setup';
import MapDoc, {Map} from '../models/map.model';
import ChokePointDoc, {ChokePoint} from '../models/choke-point.model';
import {
  findChokePoints,
  findChokePointsByMap,
  findChokePointById,
  findChokePointByIdWithThrow,
  findChokePointByMacAddress,
  existsChokePointByMacAddress,
  createChokePoint,
  updateChokePoint,
  setChokePointMap,
  unsetChokePointMap,
  updateChokePointPosition,
  deleteChokePoint,
  upsertChokePointWithCSV,
} from '../services';
import mongoose from 'mongoose';
import fs from 'fs';

describe('ChokePoint CRUD Service', () => {
  setupTestDatabase('indoorMap-testDb-chokePoint', ['chokePoint']);

  jest.setTimeout(50000);

  // <editor-fold desc="FIND">

  it('Find chokePoints', async (done) => {
    const chokePoints: ChokePoint[] = await findChokePoints();

    expect(chokePoints).toBeTruthy();
    expect(chokePoints).toHaveLength(3);

    done();
  });

  it('Find chokePoints by a map', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const chokePoints: ChokePoint[] = await findChokePointsByMap(map!._id);

    expect(chokePoints).toBeTruthy();
    expect(chokePoints).toHaveLength(1);

    done();
  });

  it('Find a chokePoint by id', async (done) => {
    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const chokePointFound: ChokePoint | null = await findChokePointById(chokePoint!._id);

    expect(chokePointFound).toBeTruthy();
    expect(chokePointFound!._id).toBeTruthy();
    expect(chokePointFound!.name).toStrictEqual(chokePoint!.name);
    expect(chokePointFound!.macAddress).toBeTruthy();
    expect(chokePointFound!.map).toBeTruthy();
    expect(chokePointFound!.x).not.toBeTruthy();
    expect(chokePointFound!.y).not.toBeTruthy();

    done();
  });

  it('Find a chokePoint by id throws', async (done) => {
    await expect(findChokePointByIdWithThrow(new mongoose.Types.ObjectId().toHexString()))
        .rejects.toThrow();
    await expect(findChokePointByIdWithThrow(new mongoose.Types.ObjectId().toHexString()))
        .rejects.toThrowError('error.notFound.chokePoint');

    done();
  });

  it('Find a chokePoint by macAddress', async (done) => {
    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const chokePointFound: ChokePoint | null = await findChokePointByMacAddress(chokePoint!.macAddress);

    expect(chokePointFound).toBeTruthy();
    expect(chokePointFound!._id).toBeTruthy();
    expect(chokePointFound!.name).toStrictEqual(chokePoint!.name);
    expect(chokePointFound!.macAddress).toBeTruthy();
    expect(chokePointFound!.macAddress).toStrictEqual(chokePoint!.macAddress);
    expect(chokePointFound!.map).toBeTruthy();
    expect(chokePointFound!.x).not.toBeTruthy();
    expect(chokePointFound!.y).not.toBeTruthy();

    done();
  });

  it('Exists a chokePoint by macAddress', async (done) => {
    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const exists: boolean = await existsChokePointByMacAddress(chokePoint!.macAddress);

    expect(exists).toStrictEqual(true);

    done();
  });

  // </editor-fold>

  // <editor-fold desc="CREATE">

  // noinspection DuplicatedCode
  it('Create a chokePoint', async (done) => {
    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();

    const chokePoint: ChokePoint = await createChokePoint(
        'TestChokePoint1',
        '112233445566'
    );

    expect(chokePoint).toBeTruthy();
    expect(chokePoint._id).toBeTruthy();
    expect(chokePoint.name).toStrictEqual('TestChokePoint1');
    expect(chokePoint.macAddress).toStrictEqual('112233445566');

    done();
  });

  // noinspection DuplicatedCode
  it('Create chokePoints with csv', async (done) => {
    fs.copyFileSync(`files/chokepoints.csv`, `tmp/uploads/chokepoints.csv`);

    const chokePoints: ChokePoint[] = await upsertChokePointWithCSV(
        'tmp/uploads/chokepoints.csv'
    );

    expect(chokePoints).toBeTruthy();
    expect(chokePoints).toHaveLength(3);

    const [first, second, third] = chokePoints;
    expect(first.name).toEqual('CSV ChokePoint 1');
    expect(first.macAddress).toEqual('70B3D580A010062F');
    expect(second.name).toEqual('CSV ChokePoint 2');
    expect(second.macAddress).toEqual('70B3D580A010062C');
    expect(third.name).toEqual('CSV ChokePoint 3');
    expect(third.macAddress).toEqual('50B3D580A010062C');

    done();
  });

  // </editor-fold>

  // <editor-fold desc="UPDATE">

  // noinspection DuplicatedCode
  it('Update a chokePoint', async (done) => {
    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const chokePointUpdated: ChokePoint = await updateChokePoint(
            chokePoint!._id,
            'TestChokePoint1',
            '665544332211',
    );

    expect(chokePointUpdated).toBeTruthy();
    expect(chokePointUpdated._id).toBeTruthy();
    expect(chokePointUpdated.name).toStrictEqual('TestChokePoint1');
    expect(chokePointUpdated.macAddress).toStrictEqual('665544332211');
    expect(chokePointUpdated.map).toBeTruthy();

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.chokePoints).toHaveLength(1);
    expect(mapUpdated!.chokePoints.filter((c) => c.name === chokePoint!.name)).toHaveLength(0);
    expect(mapUpdated!.chokePoints.filter((c) => c.name === chokePointUpdated!.name)).toHaveLength(1);

    done();
  });

  // noinspection DuplicatedCode
  it('Update chokePoints with csv', async (done) => {
    const chokePoint: ChokePoint = await createChokePoint(
        'TestChokePoint1',
        '70B3D580A010062F'
    );

    expect(chokePoint).toBeTruthy();
    expect(chokePoint._id).toBeTruthy();
    expect(chokePoint.name).toStrictEqual('TestChokePoint1');
    expect(chokePoint.macAddress).toStrictEqual('70B3D580A010062F');
    expect(chokePoint.map).not.toBeTruthy();

    fs.copyFileSync(`files/chokepoints.csv`, `tmp/uploads/chokepoints.csv`);

    const chokePoints: ChokePoint[] = await upsertChokePointWithCSV(
        'tmp/uploads/chokepoints.csv'
    );

    expect(chokePoints).toBeTruthy();
    expect(chokePoints).toHaveLength(3);

    const chokePointFound: ChokePoint | null = await findChokePointByMacAddress(chokePoint.macAddress);

    expect(chokePointFound).toBeTruthy();
    expect(chokePointFound!._id).toBeTruthy();
    expect(chokePointFound!.name).not.toStrictEqual('TestChokePoint1');
    expect(chokePointFound!.name).toStrictEqual('CSV ChokePoint 1');
    expect(chokePointFound!.macAddress).toBeTruthy();
    expect(chokePointFound!.macAddress).toStrictEqual(chokePoint!.macAddress);

    done();
  });

  // noinspection DuplicatedCode
  it('Update a chokePoint position', async (done) => {
    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const chokePointPositioned: ChokePoint | null = await updateChokePointPosition(
      chokePoint!._id,
      1000,
      900,
    );

    expect(chokePointPositioned).toBeTruthy();
    expect(chokePointPositioned!._id).toBeTruthy();
    expect(chokePointPositioned!.name).toBeTruthy();
    expect(chokePointPositioned!.macAddress).toBeTruthy();
    expect(chokePointPositioned!.map).toBeTruthy();
    expect(chokePointPositioned!.x).toStrictEqual(1000);
    expect(chokePointPositioned!.y).toStrictEqual(900);

    done();
  });

  // noinspection DuplicatedCode
  it('Set a chokePoint map', async (done) => {
    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(map).toBeTruthy();

    const chokePointUpdated: ChokePoint = await setChokePointMap(
            chokePoint!._id,
            map!._id,
            520,
            480
    );

    expect(chokePointUpdated).toBeTruthy();
    expect(chokePointUpdated._id).toBeTruthy();
    expect(chokePointUpdated.name).toBeTruthy();
    expect(chokePointUpdated.macAddress).toBeTruthy();
    expect(chokePointUpdated.x).toStrictEqual(520);
    expect(chokePointUpdated.y).toStrictEqual(480);
    expect(chokePointUpdated.map!._id).toStrictEqual(map!._id);
    expect(chokePointUpdated.map!.name).toStrictEqual(map!.name);

    const mapOld: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapOld).toBeTruthy();
    expect(mapOld!.chokePoints).toHaveLength(0);
    expect(mapOld!.chokePoints.filter((c) => c.name === chokePointUpdated.name)).toHaveLength(0);

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map2'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.chokePoints).toHaveLength(2);
    expect(mapUpdated!.chokePoints.filter((c) => c.name === chokePointUpdated.name)).toHaveLength(1);

    done();
  });

  // noinspection DuplicatedCode
  it('Unset a chokePoint map', async (done) => {
    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const chokePointUpdated: ChokePoint = await unsetChokePointMap(
      chokePoint!._id
    );

    expect(chokePointUpdated).toBeTruthy();
    expect(chokePointUpdated._id).toBeTruthy();
    expect(chokePointUpdated.name).toBeTruthy();
    expect(chokePointUpdated.macAddress).toBeTruthy();
    expect(chokePointUpdated.map).not.toBeTruthy();
    expect(chokePointUpdated.x).not.toBeTruthy();
    expect(chokePointUpdated.y).not.toBeTruthy();

    const mapOld: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapOld).toBeTruthy();
    expect(mapOld!.chokePoints).toHaveLength(0);
    expect(mapOld!.chokePoints.filter((c) => c.name === chokePointUpdated.name)).toHaveLength(0);

    done();
  });

  // </editor-fold>

  // <editor-fold desc="DELETE">

  it('Delete a chokePoint', async (done) => {
    const chokePoint: ChokePoint | null = await ChokePointDoc.findOne({name: 'ChokePoint1'});
    expect(chokePoint).toBeTruthy();

    const map: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(map).toBeTruthy();
    expect(map!.chokePoints.filter((c) => c.name === chokePoint!.name)).toHaveLength(1);

    const res: any = await deleteChokePoint(chokePoint!._id);
    expect(res).toBeTruthy();
    expect(res.deletedCount).toStrictEqual(1);

    const chokePointDeleted: ChokePoint | null = await findChokePointById(chokePoint!._id);
    expect(chokePointDeleted).not.toBeTruthy();

    const mapUpdated: Map | null = await MapDoc.findOne({name: 'Map1'});
    expect(mapUpdated).toBeTruthy();
    expect(mapUpdated!.chokePoints.filter((c) => c.name === chokePoint!.name)).toHaveLength(0);

    done();
  });

  // </editor-fold>
});
