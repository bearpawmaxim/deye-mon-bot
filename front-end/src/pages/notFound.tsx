import { FC } from "react";
import { ErrorPage } from "./errorPage";

export const NotFoundPage: FC = () => {
  return <ErrorPage errorCode={404} errorText={'404'} errorDescription={'The page you\'re looking for cannot be found!'} />;
}