import { FC, useEffect, useState } from "react"
import { StationDataItem } from "../../stores/types";
import { RootState, useAppDispatch } from "../../stores/store";
import { StationChartCard } from "./components";
import { connect } from "react-redux";
import { fetchStationsData } from "../../stores/thunks";
import { ErrorMessage, Page } from "../../components";
import { ComboboxItem, Select, SimpleGrid, Text } from "@mantine/core";

type ComponentProps = {
  stationsData: Array<StationDataItem>;
  loading: boolean;
  error: string | null;
};

const mapStateToProps = (state: RootState): ComponentProps => ({
  stationsData: state.stationsData.stationsData,
  error: state.stationsData.error,
  loading: state.stationsData.loading,
});

const intervalOptions: ComboboxItem[] = [
  {
    label: 'Last 15 minutes',
    value: '900',
  },
  {
    label: 'Last 30 minutes',
    value: '1800',
  },
  {
    label: 'Last 1 hour',
    value: '3600',
  },
  {
    label: 'Last 3 hours',
    value: (3600 * 3).toString(),
  },
  {
    label: 'Last 6 hours',
    value: (3600 * 6).toString(),
  },
  {
    label: 'Last day',
    value: (3600 * 12).toString(),
  },
];

const Component: FC<ComponentProps> = ({ stationsData, loading, error }) => {
  const dispatch = useAppDispatch();
  const [dataInterval, setDataInterval] = useState('1800');

  useEffect(() => {
    dispatch(fetchStationsData(parseInt(dataInterval)));
    const interval = setInterval(() => dispatch(fetchStationsData(parseInt(dataInterval))), 30000);
    return () => clearInterval(interval);
  }, [dispatch, dataInterval]);

  const onDataIntervalChange = (_: unknown, option: ComboboxItem) => {
    const interval = parseInt(option.value);
    setDataInterval(interval.toString());
  };

  if (error) {
    return <ErrorMessage content={error} />;
  }

  return <Page loading={loading}>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 2, lg: 4 }}>
      <Select
        label={'Interval:'}
        value={dataInterval}
        data={intervalOptions}
        onChange={onDataIntervalChange}
      />
      </SimpleGrid>
      { !error && stationsData.map(data => <StationChartCard key={`st_data_${data.id}`} data={data} />)}
      { error && <ErrorMessage content={error} />}
    </Page>;
}

export const HomePage = connect(mapStateToProps)(Component);