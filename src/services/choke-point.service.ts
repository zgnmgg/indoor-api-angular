import {Map} from '../models/map.model';
import {Location} from '../models/location.model';
import ChokePointDoc, {ChokePoint} from '../models/choke-point.model';
import {
  findMapByIdWithThrow,
  addChokePointIntoMap,
  updateChokePointInMap,
  removeChokePointFromMap, updateChokePointInLocation,
} from './';
import {AppError} from '../common/error';
import {ChokePointSub} from '../models/_sub.model';
import csvParser from '../shared/csv.parser';

/**
 * Get all ChokePoints
 * @return {Promise<ChokePoint[]>}
 */
export async function findChokePoints() {
  return ChokePointDoc.find()
      .select({
        _id: 1,
        name: 1,
        macAddress: 1,
        map: 1,
        location: 1,
        x: 1,
        y: 1,
      })
      .lean<ChokePoint[]>();
}

/**
 * Get all ChokePoints by map
 * @param {string} mapId
 * @return {Promise<ChokePoint[]>}
 */
export async function findChokePointsByMap(
    mapId: string) {
  return ChokePointDoc.find({'map._id': mapId})
      .select({
        _id: 1,
        name: 1,
        macAddress: 1,
        x: 1,
        y: 1,
      })
      .lean<ChokePoint[]>();
}

/**
 * Get all ChokePoints by location
 * @param {string} locationId
 * @return {Promise<Location[]>}
 */
export async function findChokePointsByLocation(
    locationId: string) {
  return ChokePointDoc.find({'location._id': locationId})
      .select({
        _id: 1,
        name: 1,
        macAddress: 1,
        x: 1,
        y: 1,
      })
      .lean<ChokePoint[]>();
}

/**
 * Get ChokePoint by id
 * @param {string} id
 * @return {Promise<ChokePoint | null>}
 */
export async function findChokePointById(
    id: string) {
  return ChokePointDoc.findOne({_id: id})
      .select({
        _id: 1,
        name: 1,
        macAddress: 1,
        map: 1,
        location: 1,
        x: 1,
        y: 1,
      })
      .lean<ChokePoint>();
}

/**
 * Get a ChokePoint by id with throw
 * Throw notFound error if chokePoint not exists
 * @param {string} id
 * @return {Promise<ChokePoint>}
 */
export async function findChokePointByIdWithThrow(
    id: string) {
  const chokePoint = await findChokePointById(id);
  if (! chokePoint) throw new AppError('error.notFound.chokePoint', 404, true);
  return chokePoint;
}

/**
 * Get ChokePoints by ids
 * @param {string} ids
 * @return {Promise<ChokePoint | null>}
 */
export async function findChokePointsByIds(
    ids: string[]) {
  return ChokePointDoc.find({_id: {$in: ids}})
      .select({
        _id: 1,
        name: 1,
        macAddress: 1,
        map: 1,
        location: 1,
        x: 1,
        y: 1,
      })
      .lean<ChokePoint[]>();
}

/**
 * Get ChokePoint by mac address
 * @param {string} macAddress
 * @return {Promise<ChokePoint | null>}
 */
export async function findChokePointByMacAddress(
    macAddress: string) {
  return ChokePointDoc.findOne({macAddress})
      .select({
        _id: 1,
        name: 1,
        macAddress: 1,
        map: 1,
        location: 1,
        x: 1,
        y: 1,
      })
      .lean<ChokePoint>();
}

/**
 * Exists ChokePoint by mac address
 * @return {Promise<boolean>}
 * @param {string} macAddress
 */
export async function existsChokePointByMacAddress(
    macAddress: string) {
  return ChokePointDoc.exists({macAddress});
}

/**
 * Create a ChokePoint
 * After create, update map chokePoints (add)
 * TODO Need transaction
 * @param {string} name
 * @param {string} macAddress
 * @return {Promise<ChokePoint>}
 */
export async function createChokePoint(
    name: string,
    macAddress: string) {
  const chokePoint: ChokePoint = new ChokePointDoc(
      {name, macAddress},
  );
  return await chokePoint.save();
}

/**
 * Update a ChokePoint
 * After update, update chokePoints of map (update)
 * TODO Need transaction
 * @param {string} id
 * @param {string} name
 * @param {string} macAddress
 * @return {Promise<ChokePoint>}
 */
export async function updateChokePoint(
    id: string,
    name: string,
    macAddress: string) {
  const chokePoint: ChokePoint = await findChokePointByIdWithThrow(id);

  const chokePointUpdated: ChokePoint | null =
    await ChokePointDoc.findOneAndUpdate(
        {_id: id},
        {
          name,
          macAddress,
        },
        {new: true}
    ).lean<ChokePoint>();

  if (! chokePointUpdated) {
    throw new AppError('error.notFound.chokePoint', 404, true);
  }

  if (chokePoint.map) {
    await updateChokePointInMap(
        chokePoint.map._id, chokePointUpdated,
    );
  }

  if (chokePoint.location) {
    await updateChokePointInLocation(
        chokePoint.location._id, chokePointUpdated,
    );
  }

  return chokePointUpdated;
}

/**
 * Create/Update ChokePoints via csv
 * TODO Need transaction
 * @param {string} path
 * @return {Promise<ChokePoint[]>}
 */
export async function upsertChokePointWithCSV(
    path: string): Promise<ChokePoint[]> {
  const chokePoints = await csvParser<ChokePoint>(path);

  const returnedChokePoints: ChokePoint[] = [];
  const newChokePoints: ChokePoint[] = [];

  for (const chokePoint of chokePoints) {
    const chokePointExisted =
      await findChokePointByMacAddress(chokePoint.macAddress);

    if (chokePointExisted) {
      const chokePointUpdated = await updateChokePoint(
          chokePointExisted._id,
          chokePoint.name,
          chokePoint.macAddress
      );

      if (chokePointUpdated) returnedChokePoints.push(chokePointUpdated);
    } else {
      newChokePoints.push(chokePoint);
    }
  }

  for (const chokePoint of newChokePoints) {
    const chokePointNew = await createChokePoint(
        chokePoint.name,
        chokePoint.macAddress
    );

    returnedChokePoints.push(chokePointNew);
  }

  return returnedChokePoints;
}

/**
 * Update a ChokePoint position
 * @param {string} id
 * @param {number} x
 * @param {number} y
 * @return {Promise<ChokePoint | null>}
 */
export async function updateChokePointPosition(
    id: string,
    x: number,
    y: number) {
  return ChokePointDoc.findOneAndUpdate(
      {_id: id},
      {
        x,
        y,
      },
      {new: true}
  ).lean<ChokePoint>();
}

/**
 * Set a ChokePoint map and position
 * After update, update chokePoints of map (remove, add or update)
 * TODO Need transaction
 * @param {string} id
 * @param {string} mapId
 * @param {number} x
 * @param {number} y
 * @return {Promise<ChokePoint>}
 */
export async function setChokePointMap(
    id: string,
    mapId: string,
    x: number,
    y: number) {
  const chokePoint: ChokePoint = await findChokePointByIdWithThrow(id);
  const map: Map = await findMapByIdWithThrow(mapId);

  if (! (map && x && y)) {
    throw new AppError('error.missing_parameter.chokePoint_set_map', 401, true);
  }

  const chokePointUpdated: ChokePoint | null = await ChokePointDoc.findOneAndUpdate(
      {_id: id},
      {
        map,
        x,
        y,
      },
      {new: true}
  ).lean<ChokePoint>();

  if (! chokePointUpdated) {
    throw new AppError('error.notFound.chokePoint', 404, true);
  }

  if (chokePoint.map) {
    if (chokePointUpdated.map) {
      if (chokePointUpdated.map._id.equals(chokePoint.map._id)) {
        await updateChokePointInMap(
            chokePointUpdated.map._id, chokePointUpdated,
        );
      } else {
        await removeChokePointFromMap(
            chokePoint.map._id, chokePoint,
        );
        await addChokePointIntoMap(
            chokePointUpdated.map._id, chokePointUpdated,
        );
      }
    } else {
      await removeChokePointFromMap(
          chokePoint.map._id, chokePoint,
      );
    }
  } else if (chokePointUpdated.map) {
    await addChokePointIntoMap(
        chokePointUpdated.map._id, chokePointUpdated,
    );
  }

  return chokePointUpdated;
}

/**
 * Unset a ChokePoint map and position (remove map, x and y attributes)
 * After update, update chokePoints of map (remove)
 * TODO Need transaction
 * @param {string} id
 * @return {Promise<ChokePoint>}
 */
export async function unsetChokePointMap(
    id: string) {
  const chokePoint: ChokePoint = await findChokePointByIdWithThrow(id);

  const chokePointUpdated: ChokePoint | null = await ChokePointDoc.findOneAndUpdate(
      {_id: id},
      {
        map: undefined,
        x: undefined,
        y: undefined,
      },
      {new: true}
  ).lean<ChokePoint>();

  if (! chokePointUpdated) {
    throw new AppError('error.notFound.chokePoint', 404, true);
  }

  if (chokePoint.map) {
    await removeChokePointFromMap(
        chokePoint.map._id, chokePoint,
    );
  }

  return chokePointUpdated;
}

/**
 * Delete a ChokePoint
 * Before delete, update chokePoints of map (remove)
 * TODO Need transaction
 * @param {string} id
 * @return {Promise<{n, deletedCount, ok}>}
 */
export async function deleteChokePoint(
    id: string) {
  const chokePoint: ChokePoint = await findChokePointByIdWithThrow(id);

  if (chokePoint.map) {
    await removeChokePointFromMap(chokePoint.map._id, chokePoint);
  }

  return ChokePointDoc.deleteOne({_id: id});
}

// <editor-fold desc="Map">

/**
 * Update map of chokePoints
 * @param {ChokePointSub[]} chokePoints
 * @param {Map | undefined} map?
 * @return {Promise<{n, nModified, ok}>}
 */
export async function updateMapOfChokePoints(
    chokePoints: ChokePointSub[],
    map?: Map) {
  return ChokePointDoc.updateMany(
      {_id: {$in: chokePoints.map((c) => c._id)}},
      {map: map},
  );
}

// </editor-fold>

// <editor-fold desc="Location">

/**
 * Update location of chokePoints
 * @param {ChokePointSub[]} chokePoints
 * @param {Location | undefined} location?
 * @return {Promise<{n, nModified, ok}>}
 */
export async function updateLocationOfChokePoints(
    chokePoints: ChokePointSub[],
    location?: Location) {
  return ChokePointDoc.updateMany(
      {_id: {$in: chokePoints.map((c) => c._id)}},
      {location: location},
  );
}

// </editor-fold>
