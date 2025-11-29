import { useSelector } from 'react-redux';
import { useEffect, useCallback, useRef } from 'react';
import { LookupSchema, LookupValue } from '../types';
import { RootState, useAppDispatch } from '../stores/store';
import { fetchLookupValues } from '../stores/thunks/lookupValues';

type UseLookupOptions = {
  autoFetch?: boolean;
  valueColumn?: string;
};

type UseLookupResult = {
  data: Array<LookupValue>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export const useLookup = (schema: LookupSchema, options: UseLookupOptions = { autoFetch: true, }): UseLookupResult => {
  const dispatch = useAppDispatch();

  const data = useSelector((state: RootState) => state.lookupValues.items[schema]);
  const loading = useSelector((state: RootState) => state.lookupValues.loading[schema]);
  const error = useSelector((state: RootState) => state.lookupValues.error[schema]);

  const requestedRef = useRef(false);

  const fetch = useCallback(() => {
    requestedRef.current = true;
    dispatch(fetchLookupValues(schema));
  }, [dispatch, schema]);

  useEffect(() => {
    if (options.autoFetch && !requestedRef.current) {
      fetch();
    }
  }, [options.autoFetch, fetch]);

  return { data, loading, error, refetch: fetch };
};
