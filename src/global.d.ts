/* eslint-disable no-unused-vars */

declare namespace Express {
    export interface Request {
        asset?: import('./models/asset.model').Asset;
        map?: import('./models/map.model').Map;
        location?: import('./models/location.model').Location;
        chokePoint?: import('./models/choke-point.model').ChokePoint;
        language: string;
        languages: string[];
        i18n: import('i18next').i18n;
        t: import('i18next').TFunction;
    }
}
