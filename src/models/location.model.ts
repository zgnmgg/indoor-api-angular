import mongoose, {Schema, Document} from 'mongoose';
import {
  AssetSub,
  AssetSubSchema,
  ChokePointSub,
  ChokePointSubSchema,
  PositionSub,
  PositionSubSchema,
} from './_sub.model';

export interface Location extends Document {
    name: string;
    position: PositionSub;
    asset?: AssetSub;
    chokePoints: ChokePointSub[];
}

const LocationSchema: Schema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  position: {
    type: PositionSubSchema,
    required: true,
  },
  asset: {
    type: AssetSubSchema,
  },
  chokePoints: {
    type: [ChokePointSubSchema],
    default: [],
  }
});

export default mongoose.model<Location>('Location', LocationSchema);
