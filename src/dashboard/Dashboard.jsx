import React, { useEffect } from "react";
import NavBar from "../component/NavBar";
import ApplicationContent from "../component/ApplicationContent";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails } from "../reducer/userDetailsSlice";

function Dashboard() {
  const authorizationHeader = useSelector(
    (state) => state.authorizationHeader.value
  );
  const userDetails = useSelector((state) => state.userDetails.value);
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const id = userDetails.id;

    async function fetchAPI() {
      await fetch(
        `http://authentication.bugtracker.com/getUserSelf/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: authorizationHeader,
            "Content-Type": "application/json",
          },
        },
        { signal: signal }
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          const user = { id: data.id, name: data.name, role: data.role };
          dispatch(setUserDetails(user));
        })
        .catch((err) => {
          console.log(err);
        });
    }

    fetchAPI();
    return () => controller.abort();
  }, [useLocation()]);

  return (
    <>
      <NavBar />
      <ApplicationContent />
    </>
  );
}

export default Dashboard;
