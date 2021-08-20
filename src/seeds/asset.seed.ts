
import AssetDoc from '../models/asset.model';

/**
 * Asset seed module
 */
export default async function seed() {
  await AssetDoc.insertMany([
    {name: 'Asset1', maps: [], locations: []},
    {name: 'Asset2', maps: [], locations: []},
    {name: 'Asset3', maps: [], locations: []},
  ]);
}
