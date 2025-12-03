export enum LookupSchema {
  Building = 'building',
  Message = 'message',
  Station = 'station',
  User = 'user',
  ReporterUser = 'reporter_user',
};

export type LookupValue = {
  value?: number;
  text: string;
};
