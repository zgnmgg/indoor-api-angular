
import AssetDoc, {Asset} from '../models/asset.model';
import {Map} from '../models/map.model';
import {Location} from '../models/location.model';
import {AppError} from '../common/error';
import {
  updateAssetOfMaps
} from './';

/**
 * Get all Assets
 * @return {Promise<Asset[]>}
 */
export async function findAssets(): Promise<Asset[]> {
  return AssetDoc.find()
      .select({
        _id: 1,
        name: 1,
      })
      .lean<Asset[]>();
}

/**
 * Get Asset by id
 * @param {string} id
 * @return {Promise<Asset | null>}
 */
export async function findAssetById(id: string) {
  return AssetDoc.findOne({_id: id})
      .select({
        _id: 1,
        name: 1,
        maps: 1
      })
      .lean<Asset>();
}

/**
 * Get an Asset by id with throw
 * Throw notFound error if asset not exists
 * @param {string} id
 * @return {Promise<Asset>}
 */
export async function findAssetByIdWithThrow(id: string) {
  const asset: Asset | null = await findAssetById(id);
  if (! asset) throw new AppError('error.notFound.asset', 404, true);
  return asset;
}

/**
 * Create an Asset
 * @param {string} name
 * @return {Promise<Asset>}
 */
export async function createAsset(name: string) {
  const asset: Asset = new AssetDoc({name});
  return asset.save();
}

/**
 * Update an Asset attributes
 * After update, update asset of maps (update)
 * TODO Need transaction
 * @param {Asset} asset
 * @param {string} name
 * @return {Promise<Asset>}
 */
export async function updateAsset(asset: Asset, name: string) {
  const assetUpdated: Asset | null = await AssetDoc.findOneAndUpdate(
      {_id: asset._id},
      {name: name},
      {new: true},
  ).lean<Asset>();

  if (! assetUpdated) throw new AppError('error.notFound.asset', 404, true);

  await updateAssetOfMaps(asset.maps || [], assetUpdated);

  return assetUpdated;
}

/**
 * Delete an Asset if asset includes any maps
 * @param {string} id
 * @return {Promise<{n, deletedCount, ok}>}
 */
export async function deleteAsset(id: string) {
  const asset: Asset = await findAssetByIdWithThrow(id);

  if (asset.maps.length > 0) {
    throw new AppError('error..delete.asset_map_exists', 400, true);
  }

  // await updateAssetOfMaps(asset.maps || [], undefined);

  return AssetDoc.deleteOne({_id: id});
}

// <editor-fold desc="Map">

/**
 * Add map into assets
 * It pushes new map into asset.maps
 * @param {string} id
 * @param {Map} map
 * @return {Promise<Asset | null>}
 */
export async function addMapIntoAsset(id: string, map: Map) {
  return AssetDoc.findOneAndUpdate(
      {_id: id},
      {$push: {maps: map}},
      {new: true},
  ).lean<Asset>();
}

/**
 * Update map in asset
 * It updates a map in asset.maps
 * @param {string} id
 * @param {Map} map
 * @return {Promise<Asset | null>}
 */
export async function updateMapInAsset(id: string, map: Map) {
  return AssetDoc.findOneAndUpdate(
      {'_id': id, 'maps._id': map._id},
      {'maps.$': map},
      {new: true},
  ).lean<Asset>();
}

/**
 * Remove map from asset
 * It pulls a map from asset.maps
 * @param {string} id
 * @param {Map} map
 * @return {Promise<{n, nModified, ok}>}
 */
export async function removeMapFromAsset(id: string, map: Map) {
  return AssetDoc.updateMany(
      {_id: id},
      {
        $pull: {
          maps: {_id: map._id},
        },
      },
  );
}

// </editor-fold>

// <editor-fold desc="Location">

/**
 * Add location into assets
 * It pushes new location into asset.locations
 * @param {string} id
 * @param {Location} location
 * @return {Promise<Asset | null>}
 */
export async function addLocationIntoAsset(id: string, location: Location) {
  return AssetDoc.findOneAndUpdate(
      {_id: id},
      {$push: {locations: location}},
      {new: true},
  ).lean<Asset>();
}

/**
 * Update location in asset
 * It updates a location in asset.locations
 * @param {string} id
 * @param {Location} location
 * @return {Promise<Asset | null>}
 */
export async function updateLocationInAsset(id: string, location: Location) {
  return AssetDoc.findOneAndUpdate(
      {'_id': id, 'locations._id': location._id},
      {'locations.$': location},
      {new: true},
  ).lean<Asset>();
}

/**
 * Remove location from asset
 * It pulls a location from asset.locations
 * @param {string} id
 * @param {Location} location
 * @return {Promise<{n, nModified, ok}>}
 */
export async function removeLocationFromAsset(id: string, location: Location) {
  return AssetDoc.updateMany(
      {_id: id},
      {
        $pull: {
          locations: {_id: location._id},
        },
      },
  );
}

// </editor-fold>
