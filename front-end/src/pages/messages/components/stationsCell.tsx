import { FC } from "react";
import { Anchor, Text } from '@mantine/core';
import { LookupValue } from "../../../types";

type StationsCellProps = {
  stations: number[];
  stationsLookup: LookupValue[];
}

export const StationsCell: FC<StationsCellProps> = ({ stations, stationsLookup }) => {
  return <>
    {stations.map((station, idx) => <Text key={`st_${idx}`}>
      <Anchor href={`/stations/details/${station}`}>
        {stationsLookup.find(f => f.value === station)?.text}
      </Anchor>
    </Text>)}
  </>;
}