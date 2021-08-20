
import MapDoc, {Map} from '../models/map.model';
import ChokePointDoc, {ChokePoint} from '../models/choke-point.model';
import mapSeed from './map.seed';

/**
 * ChokePoint seed module
 * It seeds map also
 * It seeds asset also
 */
export default async function seed() {
  // it seeds assets also
  await mapSeed();

  const map1: Map | null = await MapDoc.findOne({name: 'Map1'});
  const map2: Map | null = await MapDoc.findOne({name: 'Map2'});
  const map3: Map | null = await MapDoc.findOne({name: 'Map3'});

  await ChokePointDoc.insertMany([
    {name: 'ChokePoint1', macAddress: '112233', map: map1 || undefined},
    {name: 'ChokePoint2', macAddress: '445566', map: map2 || undefined},
    {name: 'ChokePoint3', macAddress: '778899', map: map3 || undefined},
  ]);

  const chokePoints: ChokePoint[] = await ChokePointDoc.find();

  for (const chokePoint of chokePoints) {
    await MapDoc.findOneAndUpdate(
        {_id: chokePoint.map?._id},
        {$push: {chokePoints: chokePoint}},
    );
  }
}
