import mongoose, {Schema, Document} from 'mongoose';
import {
  LocationSub,
  LocationSubSchema,
  MapSub,
  MapSubSchema,
} from './_sub.model';

export interface Asset extends Document{
    name: string;
    maps: MapSub[];
    locations: LocationSub[];
}

const AssetSchema: Schema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  maps: {
    type: [MapSubSchema],
    default: [],
  },
  locations: {
    type: [LocationSubSchema],
    default: [],
  }
});

export default mongoose.model<Asset>('Asset', AssetSchema);
