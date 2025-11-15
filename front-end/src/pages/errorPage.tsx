import { FC, useEffect } from "react";
import { Page } from "../components";
import { Box, Title } from "@mantine/core";
import { useHeaderContent } from "../providers";
import classes from './styles/pageCommon.module.css';

type ErrorPageProps = {
  errorText: string;
  errorCode: number;
  errorDescription: string;
};

export const ErrorPage: FC<ErrorPageProps> = ({ errorCode, errorText, errorDescription }) => {
    const { setHeaderText, resetHeaderText } = useHeaderContent();
    useEffect(() => {
      setHeaderText(errorText);
      return () => {
        resetHeaderText();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    return (
      <Page>
        <Box className={classes.centeredBox}>
          <Title ta="center" fw="bold" size={500} className={classes.errorCode}>
            {errorCode}
          </Title>

          <Title order={1} style={{ zIndex: 1 }} w="50%" ta="center">
            {errorDescription}
          </Title>

        </Box>
      </Page>
    );

};