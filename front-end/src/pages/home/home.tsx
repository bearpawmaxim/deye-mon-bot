import { FC, useEffect, useState } from "react"
import { Dropdown, DropdownItemProps, DropdownProps, Message, Segment } from "semantic-ui-react"
import { StationDataItem } from "../../stores/types";
import { RootState, useAppDispatch } from "../../stores/store";
import { StationChartCard } from "./components";
import { connect } from "react-redux";
import { fetchStationsData } from "../../stores/thunks";


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

const intervalOptions: DropdownItemProps[] = [
  {
    key: 'last_15_m',
    text: 'Last 15 minutes',
    value: 900,
  },
  {
    key: 'last_30_m',
    text: 'Last 30 minutes',
    value: 1800,
  },
  {
    key: 'last_1_h',
    text: 'Last 1 hour',
    value: 3600,
  },
  {
    key: 'last_3_h',
    text: 'Last 3 hours',
    value: 3600 * 3,
  },
  {
    key: 'last_6_h',
    text: 'Last 6 hours',
    value: 3600 * 6,
  },
  {
    key: 'last_1_d',
    text: 'Last day',
    value: 3600 * 12,
  },
];

const Component: FC<ComponentProps> = ({ stationsData, loading, error }) => {
  const dispatch = useAppDispatch();
  const [dataInterval, setDataInterval] = useState(1800);

  useEffect(() => {
    dispatch(fetchStationsData(dataInterval));
    const interval = setInterval(() => dispatch(fetchStationsData(dataInterval)), 30000);
    return () => clearInterval(interval);
  }, [dispatch, dataInterval]);

  const onDataIntervalChange = (_: unknown, data: DropdownProps) => {
    const interval = Number(data.value!);
    setDataInterval(interval);
  };

  if (error) {
    return <Message error>Error: {error}</Message>;
  }

  return <Segment loading={loading} basic>
      <Segment inverted>
        Interval: <Dropdown
          selection
          value={dataInterval}
          options={intervalOptions}
          onChange={onDataIntervalChange}
        />
      </Segment>
      { !error && stationsData.map(data => <StationChartCard key={`st_data_${data.id}`} data={data} />)}
      { error && <Message color="black" error>{error}</Message>}
    </Segment>;
}

export const HomePage = connect(mapStateToProps)(Component);