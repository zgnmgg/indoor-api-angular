
import {Schema, Document} from 'mongoose';

export interface AssetSub extends Document {
  name: string;
}

export interface MapSub extends Document {
  name: string;
}

export interface LocationSub extends Document {
  name: string;
}

export interface ChokePointSub extends Document {
  name: string;
  macAddress: string;
  x?: number;
  y?: number;
}

export interface PositionSub extends Document {
  lat: number;
  lng: number;
}

const AssetSubSchema: Schema = new Schema({
  name: {type: String, required: true},
});

const MapSubSchema: Schema = new Schema({
  name: {type: String, required: true},
});

const LocationSubSchema: Schema = new Schema({
  name: {type: String, required: true},
});

const ChokePointSubSchema: Schema = new Schema({
  name: {type: String, required: true},
  x: {type: Number},
  y: {type: Number},
});

const PositionSubSchema: Schema = new Schema({
  lat: {type: Number, required: true},
  lng: {type: Number, required: true},
}, {_id: false});

export {
  AssetSubSchema,
  MapSubSchema,
  LocationSubSchema,
  ChokePointSubSchema,
  PositionSubSchema
};
