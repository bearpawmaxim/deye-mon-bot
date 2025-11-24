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

export type StationDetailsDataPoint = {
  id: number;
  stationId: string;
  batteryPower: number | null;
  batterySoc: number | null;
  chargePower: number | null;
  code: string | null;
  consumptionPower: number | null;
  dischargePower: number | null;
  generationPower: number | null;
  gridPower: number | null;
  irradiateIntensity: number | null;
  lastUpdateTime: Date;
  msg: string | null;
  purchasePower: number | null;
  requestId: string | null;
  wirePower: number | null;
};

export type StationInfo = {
  id: number;
  stationId: string;
  stationName: string;
  connectionStatus: string;
  gridInterconnectionType: string;
  installedCapacity: number | null;
  batteryCapacity: number | null;
  lastUpdateTime: Date | null;
};

export type StationDetailsData = {
  station: StationInfo;
  data: Array<StationDetailsDataPoint>;
  dataCount: number;
};

export type StationsDataState = BaseState & {
  stationsData: Array<StationDataItem>;
  stationDetails: StationDetailsData | null;
  detailsLoading: boolean;
  detailsError: string | null;
}