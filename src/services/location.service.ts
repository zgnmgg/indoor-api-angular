
import {Asset} from '../models/asset.model';
import LocationDoc, {Location} from '../models/location.model';
import {ChokePoint} from '../models/choke-point.model';
import {AppError} from '../common/error';
import {LocationSub} from '../models/_sub.model';
import {
  findAssetById,
  addLocationIntoAsset,
  updateLocationInAsset,
  removeLocationFromAsset,
  updateLocationOfChokePoints, findChokePointsByIds,
} from './';

/**
 * Get all Locations
 * @return {Promise<Location[]>}
 */
export async function findLocations() {
  return LocationDoc.find()
      .select({
        _id: 1,
        name: 1,
        position: 1,
        asset: 1,
        chokePoints: 1
      })
      .lean<Location[]>();
}

/**
 * Get all Locations by asset
 * @param {string} assetId
 * @return {Promise<Location[]>}
 */
export async function findLocationsByAsset(
    assetId: string) {
  return LocationDoc.find({'asset._id': assetId})
      .select({
        _id: 1,
        name: 1,
        position: 1,
        chokePoints: 1
      })
      .lean<Location[]>();
}

/**
 * Get Location by id
 * @param {string} id
 * @return {Promise<Location | null>}
 */
export async function findLocationById(id: string) {
  return LocationDoc.findOne({_id: id})
      .select({
        _id: 1,
        name: 1,
        position: 1,
        asset: 1,
        chokePoints: 1
      })
      .lean<Location>();
}

/**
 * Get a Location by id with throw
 * Throw notFound error if location not exists
 * @param {string} id
 * @return {Promise<Location>}
 */
export async function findLocationByIdWithThrow(id: string) {
  const location: Location | null = await findLocationById(id);
  if (! location) throw new AppError('error.notFound.location', 404, true);
  return location;
}

/**
 * Get Location by id and asset
 * @param {string} id
 * @param {string} assetId
 * @return {Promise<Location | null>}
 */
export async function findLocationByIdAndAssetId(id: string, assetId: string) {
  return LocationDoc.findOne({'_id': id, 'asset._id': assetId})
      .select({
        _id: 1,
        name: 1,
        position: 1,
        asset: 1,
        chokePoints: 1
      })
      .lean<Location>();
}

/**
 * Get a Location by id and asset with throw
 * Throw notFound error if location not exists
 * @param {string} id
 * @param {string} assetId
 * @return {Promise<Location>}
 */
export async function findLocationByIdAndAssetIdWithThrow(
    id: string,
    assetId: string) {
  const location: Location | null = await findLocationByIdAndAssetId(id, assetId);
  if (! location) throw new AppError('error.notFound.location', 404, true);
  return location;
}

/**
 * Create a Location
 * After create, update asset locations (add)
 * TODO Need transaction
 * @param {string} name
 * @param {{lat: number, lng: number}} position: position of real world
 * @param {string[]} chokePointIds
 * @param {string} assetId
 * @return {Promise<Location>}
 */
export async function createLocation(
    name: string,
    position: {lat: number, lng: number},
    chokePointIds: string[],
    assetId?: string) {
  const asset: Asset | null = assetId ? await findAssetById(assetId) : null;
  const location: Location = new LocationDoc({
    name,
    position,
    chokePoints: await findChokePointsByIds(chokePointIds),
    asset
  });
  await location.save();

  if (asset) await addLocationIntoAsset(asset._id, location);

  return location;
}

/**
 * Update a Location
 * After update, update locations of asset (remove, add or update)
 * After update, update location of chokePoints (update)
 * TODO Need transaction
 * @param {Location} location
 * @param {string} name
 * @param {{lat: number, lng: number}} position: position of real world
 * @param {string[]} chokePointIds
 * @param {string} assetId
 * @return {Promise<Location>}
 */
export async function updateLocation(
    location: Location,
    name: string,
    position: {lat: number, lng: number},
    chokePointIds: string[],
    assetId?: string) {
  const asset: Asset | null = assetId ? await findAssetById(assetId) : null;
  const locationUpdated: Location | null = await LocationDoc.findOneAndUpdate(
      {_id: location._id},
      {
        name,
        position,
        chokePoints: await findChokePointsByIds(chokePointIds),
        asset: asset || undefined,
      },
      {new: true}
  ).lean<Location>();

  if (! locationUpdated) {
    throw new AppError('error.notFound.location', 404, true);
  }

  if (location.asset) {
    if (locationUpdated.asset) {
      if (locationUpdated.asset._id.equals(location.asset._id)) {
        await updateLocationInAsset(locationUpdated.asset._id, locationUpdated);
      } else {
        await removeLocationFromAsset(location.asset._id, location);
        await addLocationIntoAsset(locationUpdated.asset._id, locationUpdated);
      }
    } else {
      await removeLocationFromAsset(location.asset._id, location);
    }
  } else if (locationUpdated.asset) {
    await addLocationIntoAsset(locationUpdated.asset._id, locationUpdated);
  }

  await updateLocationOfChokePoints(location.chokePoints || [], undefined);
  await updateLocationOfChokePoints(locationUpdated.chokePoints || [], locationUpdated);

  return locationUpdated;
}

/**
 * Delete a Location if location includes any chokePoints
 * Before delete, update locations of asset (remove)
 * TODO Need transaction
 * @param {string} id
 * @return {Promise<{n, deletedCount, ok}>}
 */
export async function deleteLocation(id: string) {
  const location: Location = await findLocationByIdWithThrow(id);

  if (location.chokePoints.length > 0) {
    throw new AppError('error.delete.location_chokePoint_exists', 400, true);
  }

  // TODO Image path needs to be deleted if exists

  if (location.asset) await removeLocationFromAsset(location.asset._id, location);

  // await updateLocationOfChokePoints(location.chokePoints || [], undefined);

  return LocationDoc.deleteOne({_id: id});
}

// <editor-fold desc="Asset">

/**
 * Update asset of locations
 * @param {LocationSub[]} locations
 * @param {Asset | undefined} asset?
 * @return {Promise<n, nModified, ok>}
 */
export async function updateAssetOfLocations(locations: LocationSub[], asset?: Asset) {
  return LocationDoc.updateMany(
      {_id: {$in: locations.map((l) => l._id)}},
      {asset: asset},
  );
}

// </editor-fold>

// <editor-fold desc="ChokePoint">

/**
 * Add chokePoint into location
 * => It pushes new chokePoint into location.chokePoints
 * @param {string} id
 * @param {ChokePoint} chokePoint
 * @return {Promise<Location | null>}
 */
export async function addChokePointIntoLocation(
    id: string,
    chokePoint: ChokePoint) {
  return LocationDoc.findOneAndUpdate(
      {_id: id},
      {$push: {chokePoints: chokePoint}},
      {new: true},
  ).lean<Location>();
}

/**
 * Update chokePoint in location
 * => It updates a chokePoint in location.chokePoints
 * @param {string} id
 * @param {ChokePoint} chokePoint
 * @return {Promise<Location | null>}
 */
export async function updateChokePointInLocation(
    id: string,
    chokePoint: ChokePoint) {
  return LocationDoc.findOneAndUpdate(
      {'_id': id, 'chokePoints._id': chokePoint._id},
      {'chokePoints.$': chokePoint},
      {new: true},
  ).lean<Location>();
}

/**
 * Remove chokePoint from location
 * => It pulls a chokePoint from location.chokePoints
 * @param {string} id
 * @param {ChokePoint} chokePoint
 * @return {Promise<{n, nModified, ok}>}
 */
export async function removeChokePointFromLocation(
    id: string,
    chokePoint: ChokePoint) {
  return LocationDoc.updateMany(
      {_id: id},
      {
        $pull: {
          chokePoints: {_id: chokePoint._id},
        },
      },
  );
}

// </editor-fold>
