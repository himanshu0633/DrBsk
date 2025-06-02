// src/components/Layout/Layout.js
import { Outlet } from "react-router-dom";
import  Header  from "../Header/Header";
import  NavBar  from "../Navbar/Navbar";

export function Layout() {
  return (
    <>
      <Header />
      <NavBar />
      <Outlet /> {/* This renders the child route */}
    </>
  );
}
