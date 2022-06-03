import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Profile from "../profile/Profile";
import Ticket from "../ticket/Ticket";
import TicketExisting from "../ticket/TicketExisting";
import TicketUpdate from "../ticket/TicketUpdate";
import Project from "../project/Project";
import TicketNew from "../ticket/TicketNew";
import Error from "./Error";
import ProjectNew from "../project/ProjectNew";
import UserNew from "./user/UserNew";
import User from "./user/User";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProjectExisting from "../project/ProjectExisting";

function ApplicationContent() {
  function RequireAuth({ children, redirectTo }) {
    const authHeader = useSelector((state) => state.authorizationHeader.value);
    return authHeader === "" ? <Navigate to={redirectTo} /> : children;
  }

  function RequireAdminAuth({ children, redirectTo }) {
    const authHeader = useSelector((state) => state.authorizationHeader.value);
    const userRole = useSelector((state) => state.userDetails.value.role);
    return authHeader === "" ? (
      <Navigate to={redirectTo} />
    ) : userRole !== "admin" ? (
      <Navigate to="/error" />
    ) : (
      children
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Ticket />} />
        <Route
          path="profile"
          element={
            <RequireAuth redirectTo="login">
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="ticket/new"
          element={
            <RequireAuth redirectTo="login">
              <TicketNew />
            </RequireAuth>
          }
        />
        <Route
          path="ticket/:ticketId"
          element={
            <RequireAuth redirectTo="login">
              <TicketExisting />
            </RequireAuth>
          }
        />
        <Route
          path="ticket/update/:ticketId"
          element={
            <RequireAuth redirectTo="login">
              <TicketUpdate />
            </RequireAuth>
          }
        />
        <Route
          path="project"
          element={
            <RequireAuth redirectTo="login">
              <Project />
            </RequireAuth>
          }
        />
        <Route
          path="project/new"
          element={
            <RequireAdminAuth redirectTo="login">
              <ProjectNew />
            </RequireAdminAuth>
          }
        />
        <Route
          path="project/:projectId"
          element={
            <RequireAuth redirectTo="login">
              <ProjectExisting />
            </RequireAuth>
          }
        />
        <Route
          path="user"
          element={
            <RequireAdminAuth redirectTo="login">
              <User />
            </RequireAdminAuth>
          }
        />
        <Route
          path="user/new"
          element={
            <RequireAdminAuth redirectTo="login">
              <UserNew />
            </RequireAdminAuth>
          }
        />
        <Route
          path="error"
          element={
            <RequireAuth redirectTo="login">
              <Error />
            </RequireAuth>
          }
        />
        <Route
          path="/*"
          element={
            <RequireAuth redirectTo="login">
              <Error />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}

export default ApplicationContent;
