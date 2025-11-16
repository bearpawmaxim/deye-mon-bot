import { BaseState } from './base';

export type VisitRecord = {
  totalVisitors?: number;
  dailyVisitors?: number;
}

export type VisitCounterState = BaseState & {
  visits: VisitRecord;
};
