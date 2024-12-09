import { FC } from "react";
import { Button, Nav, Navbar, NavbarBrand, NavbarText, NavItem } from "reactstrap";
import apiClient from "../utils/apiClient";
import { useAuth } from "../providers/authProvider";

export const Header: FC = () => {
  const { token, setToken } = useAuth();

  const logout = () => {
    apiClient.post("auth/logout").then(() => setToken(null));
  };

  return Boolean(token)
    ? <Navbar full color="light" fixed="top">
        <NavbarBrand href="/">Deye monitoring bot</NavbarBrand>
        <Nav className="me-auto" navbar>
          <NavItem className="float-end">
          </NavItem>
        </Nav>
        <NavbarText>
          <Button size="sm" color="danger" onClick={logout} outline>Logout</Button>
        </NavbarText>
    </Navbar> : <></>
}