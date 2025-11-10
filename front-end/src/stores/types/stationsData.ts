import { BaseState } from "./base";

export type StationDataRecord = {
  batterySoc: number;
  dischargePower: number;
  chargePower: number;
  consumptionPower: number;
  date: Date;
};

export type StationDataItem = {
  id: number;
  name: string;
  data: Array<StationDataRecord>;
};

export type StationsDataState = BaseState & {
  stationsData: Array<StationDataItem>;
}