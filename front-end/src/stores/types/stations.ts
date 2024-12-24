import { BaseState } from "./base";

export type BaseServerStationItem = {
  id: number;
  enabled: boolean;
};

export type ServerStationItem = BaseServerStationItem & {
  stationName: string;
  connectionStatus: string;
  gridInterconnectionType: string;
  lastUpdateTime: Date;
};

export type StationItem = ServerStationItem & {
  changed: boolean;
}

export type StationsState = BaseState & {
  stations: Array<StationItem>;
}