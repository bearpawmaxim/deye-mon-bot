import { FC, useEffect } from "react"
import { StationDataItem } from "../../stores/types";
import { RootState, useAppDispatch } from "../../stores/store";
import { StationChartCard } from "./components";
import { connect } from "react-redux";
import { fetchStationsData } from "../../stores/thunks";
import { ErrorMessage } from "../../components";
import { ComboboxItem, Select, SimpleGrid } from "@mantine/core";
import useLocalStorage from "../../hooks/useLocalStorage";
import { initGA, trackPageView } from "../../utils/analytics";
import { usePageTranslation } from "../../utils";
import { TFunction } from "i18next";

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

const buildIntervalOptions = (t: TFunction): ComboboxItem[] => [
  { label: t('interval.last15'), value: '900' },
  { label: t('interval.last30'), value: '1800' },
  { label: t('interval.last1h'), value: '3600' },
  { label: t('interval.last3h'), value: (3600 * 3).toString() },
  { label: t('interval.last6h'), value: (3600 * 6).toString() },
  { label: t('interval.lastDay'), value: (3600 * 12).toString() },
  { label: t('interval.lastTwoDays'), value: (3600 * 24).toString() },
];

const Component: FC<ComponentProps> = ({ stationsData, loading, error }) => {
  const dispatch = useAppDispatch();
  const t = usePageTranslation('home');
  const [dataInterval, setDataInterval] = useLocalStorage('home_graphs_interval', '1800');
  const intervalOptions = buildIntervalOptions(t);

  useEffect(() => {
    dispatch(fetchStationsData(parseInt(dataInterval)));
    const interval = setInterval(() => dispatch(fetchStationsData(parseInt(dataInterval))), 30000);
    return () => clearInterval(interval);
  }, [dispatch, dataInterval]);

  // Google Analytics
  useEffect(() => {
    initGA();
    trackPageView('/', 'Home Page');
  }, []);

  const onDataIntervalChange = (_: unknown, option: ComboboxItem) => {
    const interval = parseInt(option.value);
    setDataInterval(interval.toString());
  };

  if (error) {
    return <ErrorMessage content={error} />;
  }

  return <>
    <SimpleGrid cols={{ base: 1, sm: 2, md: 2, lg: 4 }}>
      <Select
        label={t('label.interval')}
        value={dataInterval}
        data={intervalOptions}
        onChange={onDataIntervalChange}
      />
    </SimpleGrid>
    { !error && stationsData.map(data => <StationChartCard t={t} loading={loading} key={`st_data_${data.id}`} data={data} />)}
    { error && <ErrorMessage content={error} />}
  </>;
}

export const HomePage = connect(mapStateToProps)(Component);