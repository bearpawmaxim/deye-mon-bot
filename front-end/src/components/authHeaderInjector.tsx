import { FC, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../stores/store";
import { setAuthorizationHeader } from "../utils";

export const AuthHeaderInjector: FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  useEffect(() => {
    setAuthorizationHeader(token);
  }, [token]);

  return <></>
};