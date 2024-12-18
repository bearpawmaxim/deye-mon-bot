import { BaseEditableState } from "./base";

export type ServerStationItem = {
  id: number;
  stationName: string;
  enabled: boolean;
};

export type StationsState = BaseEditableState & {
  stations: Array<ServerStationItem>;
}