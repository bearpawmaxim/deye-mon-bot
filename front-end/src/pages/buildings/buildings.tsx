import { FC, useEffect } from "react";
import {
  Container,
  Title,
  SimpleGrid,
  Stack
} from "@mantine/core";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../stores/store";
import { fetchBuildings } from "../../stores/thunks";
import { BuildingCard, PlannedOutages, PublicHeader } from "./components";
import { BuildingListItem } from "../../stores/types";

const buildingsData: BuildingListItem[] = [
  {
    id: 1,
    name: "Building 1",
    batteryPercent: 64.0,
    batteryDischargeTime: "39:19",
    consumptionPower: 14300,
    isGridAvailable: true,
    color: "yellow",
  },
  {
    id: 2,
    name: "Building 2",
    batteryPercent: 98.5,
    batteryDischargeTime: "120:00",
    consumptionPower: 14300,
    isGridAvailable: false,
    color: "cyan.5",
  },
  {
    id: 3,
    name: "Building 3",
    batteryPercent: 25.0,
    batteryDischargeTime: "15:00",
    consumptionPower: 14300,
    isGridAvailable: true,
    color: "red.1",
  },
    {
    id: 3,
    name: "Building 3",
    batteryPercent: 25.0,
    batteryDischargeTime: "15:00",
    consumptionPower: 14300,
    isGridAvailable: true,
    color: "red.2",
  },
    {
    id: 3,
    name: "Building 3",
    batteryPercent: 0.0,
    batteryDischargeTime: "15:00",
    consumptionPower: 14300,
    isGridAvailable: true,
    color: "red.3",
  },
    {
    id: 3,
    name: "Building 3",
    batteryPercent: 12.0,
    batteryDischargeTime: "15:00",
    consumptionPower: 14300,
    isGridAvailable: true,
    color: "red.4",
  },
    {
    id: 3,
    name: "Building 3",
    batteryPercent: 24.0,
    batteryDischargeTime: "15:00",
    consumptionPower: 14300,
    isGridAvailable: true,
    color: "red.5",
  },
    {
    id: 3,
    name: "Building 3",
    batteryPercent: 34.0,
    batteryDischargeTime: "15:00",
    consumptionPower: 14300,
    isGridAvailable: true,
    color: "red.6",
  },
    {
    id: 3,
    name: "Building 3",
    batteryPercent: 44.0,
    batteryDischargeTime: "15:00",
    consumptionPower: 14300,
    isGridAvailable: true,
    color: "red.7",
  },
    {
    id: 3,
    name: "Building 3",
    batteryPercent: 54.0,
    batteryDischargeTime: "15:00",
    consumptionPower: 14300,
    isGridAvailable: true,
    color: "red.8",
  },
    {
    id: 3,
    name: "Building 3",
    batteryPercent: 75.0,
    batteryDischargeTime: "15:00",
    consumptionPower: 14300,
    isGridAvailable: true,
    color: "red.9",
  },
];

export const PublicPage: FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const isLoggedIn = !!token;

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchBuildings());
  }, [dispatch]);

  return (
    <>
      {!isLoggedIn && <PublicHeader />}
      <Container size="xl" px="xl" py={48}>
        <Stack gap={48}>
          <Title order={1} ta="center" c="blue">
            SVITLO PARK
          </Title>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            {buildingsData.map((building) => <BuildingCard building={building} />)}
          </SimpleGrid>

          <PlannedOutages />
        </Stack>
      </Container>
    </>
  );
};
