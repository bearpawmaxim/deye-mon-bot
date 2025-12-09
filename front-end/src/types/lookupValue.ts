import { ObjectId } from "../schemas";

export enum LookupSchema {
  Building = 'building',
  Message = 'message',
  Station = 'station',
  User = 'user',
  ReporterUser = 'reporter_user',
};

export type LookupValue = {
  value?: ObjectId;
  text: string;
};
