
import AssetDoc, {Asset} from '../models/asset.model';
import MapDoc, {Map} from '../models/map.model';
import assetSeed from './asset.seed';

/**
 * Map seed module
 * It seeds asset also
 */
export default async function seed() {
  await assetSeed();

  const asset1: Asset | null = await AssetDoc.findOne({name: 'Asset1'});
  const asset2: Asset | null = await AssetDoc.findOne({name: 'Asset2'});
  const asset3: Asset | null = await AssetDoc.findOne({name: 'Asset3'});

  await MapDoc.insertMany([
    {name: 'Map1', asset: asset1 || undefined,
      path: '/path1', width: 1921, height: 1081, maxZoom: 11, chokePoints: []},
    {name: 'Map2', asset: asset2 || undefined,
      path: '/path2', width: 1922, height: 1082, maxZoom: 12, chokePoints: []},
    {name: 'Map3', asset: asset3 || undefined,
      path: '/path3', width: 1923, height: 1083, maxZoom: 13, chokePoints: []},
  ]);

  const maps: Map[] = await MapDoc.find();

  for (const map of maps) {
    await AssetDoc.findOneAndUpdate(
        {_id: map.asset?._id},
        {$push: {maps: map}},
    );
  }
}
