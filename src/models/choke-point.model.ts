import mongoose, {Schema, Document} from 'mongoose';
import {
  LocationSub, LocationSubSchema,
  MapSub,
  MapSubSchema,
} from './_sub.model';

export interface ChokePoint extends Document {
    name: string;
    macAddress: string;
    map?: MapSub;
    location?: LocationSub;
    x?: number;
    y?: number;
}

const ChokePointSchema: Schema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  macAddress: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  map: {
    type: MapSubSchema,
  },
  location: {
    type: LocationSubSchema,
  },
  x: {
    type: Number,
  },
  y: {
    type: Number,
  },
});

export default mongoose.model<ChokePoint>('ChokePoint', ChokePointSchema);
