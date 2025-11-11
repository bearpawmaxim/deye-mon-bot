import { FC, useMemo } from "react";
import { StationDataItem } from "../../../stores/types";
import { Card, Text, Box, LoadingOverlay } from "@mantine/core";
import { AreaChart } from "@mantine/charts";

type StationChartCardProps = {
  data: StationDataItem;
  loading: boolean;
};

export const StationChartCard: FC<StationChartCardProps> = ({ data, loading }) => {
  const formatTimeValue = (value: Date) => new Date(value).toLocaleTimeString("uk-UA");
  const dataArray = useMemo(() => data?.data ?? [], [data]);
  const dataLength = dataArray.length;

  const processedData = useMemo(() => dataArray.map((d) => ({ ...d, time: formatTimeValue(d.date) })), [dataArray]);

  const powerSeries = useMemo(
    () => [
      {
        name: "chargePower",
        label: "Charge power",
        color: "#1BFFC2",
      },
      {
        name: "dischargePower",
        label: "Discharge power",
        color: "#FF3838",
      },
      {
        name: "consumptionPower",
        label: "Consumption power",
        color: "#FFC225",
      },
    ],
    []
  );

  const socSeries = useMemo(
    () => [{
      name: "batterySoc",
      label: "Battery SOC",
      color: "#67C2FE",
    }],
    []
  );

  return (
    <Card withBorder radius="md" p="sm" mt="sm" style={{ width: "100%" }}>
      <LoadingOverlay visible={loading} />
      <Box style={{ marginBottom: 8 }}>
        <Text style={{ fontWeight: 600 }}>{data.name}</Text>
      </Box>

      {dataLength === 0 ? (
        <Box style={{ textAlign: "center", color: "var(--mantine-color-dimmed, #888)" }}>
          No data!
        </Box>
      ) : (
        <div>
          <Box style={{ height: 240 }}>
            <AreaChart
              data={processedData}
              dataKey="time"
              series={powerSeries}
              withLegend
              withTooltip
              unit="kW"
              h='100%'
              valueFormatter={(v: number) => `${v / 1000}`}
              strokeWidth={2}
              withDots={false}
              gridProps={{ strokeDasharray: "3 2" }}
              areaChartProps={{ syncId: String(data.id) }}
            />
          </Box>

          <Box style={{ height: 240, marginTop: 8 }}>
            <AreaChart
              data={processedData}
              dataKey="time"
              series={socSeries}
              withLegend
              withTooltip
              h="100%"
              unit="%"
              withGradient
              withDots={false}
              fillOpacity={0.6}
              gridProps={{ strokeDasharray: "3 2" }}
              areaChartProps={{ syncId: String(data.id) }}
            />
          </Box>
        </div>
      )}
    </Card>
  );
};