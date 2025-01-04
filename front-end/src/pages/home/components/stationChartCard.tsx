import { FC } from "react";
import { Header, Label, Segment } from "semantic-ui-react";
import { StationDataItem } from "../../../stores/types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';


type StationChartCardProps = {
  data: StationDataItem;
};

export const StationChartCard: FC<StationChartCardProps> = ({ data }) => {
  const tooltipLabelFormatter = (value: Date) => new Date(value).toLocaleTimeString();
  const dataLength = data?.data?.length ?? 0;
  return <Segment size="large" inverted style={{width: '100%'}}>
    <Header as="h4" content={data.name} />
    { dataLength === 0 && <Label style={{textAlign: 'center'}} attached="bottom">No data!</Label>}
    { dataLength > 0 && <>
        <ResponsiveContainer aspect={1} maxHeight={200} >
          <ComposedChart
            width={400}
            height={200}
            data={data.data}
            syncId={data.id}>
            <Legend wrapperStyle={{fontSize: "12px"}} />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={8} tick={false}/>
            <YAxis fontSize={8} tickFormatter={(value) => `${Math.abs(value / 1000)} kW`} />
            <Tooltip labelStyle={{ color: 'black' }}
              labelFormatter={tooltipLabelFormatter}
              formatter={(value: number, name: string) => [`${Math.abs(value / 1000)} kW`, name]} />
            <Area
              type="linear"
              dataKey="chargePower"
              name="Charge power"
              stroke="#1B4DFF"
              fill="#1B4DFF"
              order={2}
              fillOpacity={0.8} />
            <Area
              type="linear"
              order={3}
              dataKey="dischargePower"
              name="Discharge power"
              stroke="#ff3838"
              fill="#ff3838"
              fillOpacity={0.8} />
            <Line
              type="linear"
              dataKey="consumptionPower"
              name="Consumption power"
              stroke="#FFC225"
              dot={false}
              order={1}
              strokeOpacity={1}
              fill="#FFFFFF" />
          </ComposedChart>
        </ResponsiveContainer>
        <ResponsiveContainer aspect={1} maxHeight={200} >
          <AreaChart
            width={400}
            height={200}
            data={data.data}
            syncId={data.id}>
            <Legend wrapperStyle={{fontSize: "12px"}} />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={8} tick={false} />
            <YAxis min={100} max={100} fontSize={8} />
            <Tooltip
              labelStyle={{ color: 'black' }}
              labelFormatter={tooltipLabelFormatter}
              formatter={(value: number) => `${value}%`} />
            <Area
              type="linear"
              dataKey="batterySoc"
              name="Battery SOC"
              stroke="#67C2FE"
              fill="#67C2FE" />
          </AreaChart>
        </ResponsiveContainer>
      </>
    }
    </Segment>;
};