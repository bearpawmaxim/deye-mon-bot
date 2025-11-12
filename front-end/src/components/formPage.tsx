import { FC } from "react";
import { LoadingContainerProps, Page } from "./page";

type FormPageProps = LoadingContainerProps;

export const FormPage: FC<FormPageProps> = ({ children, ...props }) =>
  <Page p="md" children={children} {...props} />;