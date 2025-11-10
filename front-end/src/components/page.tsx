import { LoadingOverlay, Paper, PaperProps } from "@mantine/core"
import { FC, ReactNode } from "react";
import { useLoading } from "../providers";

export type LoadingContainerProps = PaperProps & {
  children: ReactNode;
  loading?: boolean;
}

export const Page: FC<LoadingContainerProps> = ({ children, loading, ...props }) => {
  const { isLoading } = useLoading();

  return <Paper shadow="xl" {...props} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
    <LoadingOverlay visible={loading ?? isLoading} zIndex={99} loaderProps={{ type: 'bars' }}
       overlayProps={{ radius: "sm", blur: 4 }}  />
    {children}
  </Paper>;
}