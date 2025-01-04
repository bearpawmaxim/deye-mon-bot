import { FC } from "react";
import { Header, Label, Segment } from "semantic-ui-react";
import { StationDataItem } from "../../../stores/types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Line, ComposedChart } from 'recharts';


type StationChartCardProps = {
  data: StationDataItem;
};

export const StationChartCard: FC<StationChartCardProps> = ({ data }) => {
  const formatTimeValue = (value: Date) => new Date(value).toLocaleTimeString('uk-UA');
  const formatKilowattsValue = (value: number) => `${Math.abs(value / 1000)} kW`;
  const dataLength = data?.data?.length ?? 0;
  return <Segment size="large" inverted style={{width: '100%'}}>
    <Header as="h4" content={data.name} textAlign="center" />
    { dataLength === 0 && <Label style={{textAlign: 'center'}} attached="bottom">No data!</Label>}
    { dataLength > 0 && <>
        <ResponsiveContainer aspect={1} maxHeight={300} >
          <ComposedChart
            data={data.data}
            syncId={data.id}>
            <Legend wrapperStyle={{fontSize: "12px"}} />
            <CartesianGrid strokeDasharray="3 2" opacity={0.4} />
            <XAxis dataKey="date" fontSize={8}
              tickFormatter={formatTimeValue}  />
            <YAxis fontSize={8} tickFormatter={(value) => formatKilowattsValue(value) } />
            <Tooltip labelStyle={{ color: 'black' }}
              labelFormatter={formatTimeValue}
              formatter={(value: number, name: string) => [formatKilowattsValue(value), name]} />
            <defs>
              <linearGradient id="chargeColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1BFFC2" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#1BFFC2" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="dischargeColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF3838" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FF3838" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="linear"
              dataKey="chargePower"
              name="Charge power"
              stroke="#1BFFC2"
              fill="url(#chargeColor)"
              order={2}
              fillOpacity={1} />
            <Area
              type="linear"
              dataKey="dischargePower"
              name="Discharge power"
              stroke="#FF3838"
              fill="url(#dischargeColor)"
              order={3}
              fillOpacity={1} />
            <Line
              type="linear"
              dataKey="consumptionPower"
              name="Consumption power"
              stroke="#FFC225"
              dot={false}
              order={1}
              strokeOpacity={0.8}
              />
          </ComposedChart>
        </ResponsiveContainer>
        <ResponsiveContainer aspect={1} maxHeight={300} >
          <AreaChart
            data={data.data}
            syncId={data.id}>
            <Legend wrapperStyle={{fontSize: "12px"}} />
            <CartesianGrid strokeDasharray="3 2" opacity={0.4} />
            <XAxis dataKey="date" fontSize={8}
              tickFormatter={formatTimeValue}  />
            <YAxis type="number" domain={[0, 100]} unit={'%'} fontSize={8} />
            <Tooltip
              labelStyle={{ color: 'black' }}
              labelFormatter={formatTimeValue}
              formatter={(value: number) => `${value}%`} />
            <defs>
              <linearGradient id="socColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#67C2FE" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#67C2FE" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="linear"
              dataKey="batterySoc"
              name="Battery SOC"
              fill="url(#socColor)"
              />
          </AreaChart>
        </ResponsiveContainer>
      </>
    }
    </Segment>;
};