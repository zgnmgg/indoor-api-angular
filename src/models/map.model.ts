import mongoose, {Schema, Document} from 'mongoose';
import {
  AssetSub,
  AssetSubSchema,
  ChokePointSub,
  ChokePointSubSchema,
} from './_sub.model';

export interface Map extends Document {
    name: string;
    asset?: AssetSub;
    path?: string;
    width?: number;
    height?: number;
    maxZoom?: number;
    ratio?: number;
    chokePoints: ChokePointSub[];
}

const MapSchema: Schema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  asset: {
    type: AssetSubSchema,
  },
  path: {
    type: String,
    trim: true,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  maxZoom: {
    type: Number,
  },
  ratio: {
    type: Number,
  },
  chokePoints: {
    type: [ChokePointSubSchema],
    default: [],
  },
});

export default mongoose.model<Map>('Map', MapSchema);
