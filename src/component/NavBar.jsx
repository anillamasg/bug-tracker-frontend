import React, { useEffect, useState } from "react";
import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Form,
  FormControl,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { Link, NavLink, useNavigate } from "react-router-dom";
import { setAuthorizationHeader } from "../reducer/authorizationHeaderSlice";
import { setUserDetails } from "../reducer/userDetailsSlice";

function NavBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authorizationHeader = useSelector(
    (state) => state.authorizationHeader.value
  );
  const userDetails = useSelector((state) => state.userDetails.value);
  const [searchText, setSearchText] = useState("");

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const search = (e) => {
    e.preventDefault();
    const searchedTicketUrl = `ticket/${searchText}`;

    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: authorizationHeader,
        "Content-Type": "application/json",
      },
    };

    fetch(`http://ticket.bugtracker.com/ticket/${searchText}`, requestOptions)
      .then((response) => {
        if (response.status === 200) {
          setSearchText("");
          navigate(searchedTicketUrl);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const logout = () => {
    dispatch(setAuthorizationHeader(""));
    dispatch(setUserDetails({}));
    navigate("login");
  };

  return (
    <>
      <Navbar className="bg-main" expand="lg">
        <Container>
          <Navbar.Brand className="font-white">
            <NavLink to="/" style={{ textDecoration: "none", color: "white" }}>
              BUG TRACKER
            </NavLink>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-main" />
          <Navbar.Collapse id="navbar-main">
            <Form className="d-flex">
              <FormControl
                type="search"
                placeholder="Search Ticket ID"
                className="me-2"
                aria-label="Search"
                onChange={handleSearch}
                value={searchText}
                onKeyPress={(event) => {
                  if (event.key === "Enter" && searchText !== "") {
                    search(event);
                  }
                }}
              />
            </Form>
            <Nav>
              <NavLink to="/ticket/new" className="nav-link">
                Create Ticket
              </NavLink>
              <NavLink to="/project" className="nav-link">
                Project
              </NavLink>
              <NavDropdown title={userDetails.name} id="nav-dropdown-main">
                {userDetails.role === "admin" && (
                  <>
                    <NavDropdown.Item as="div">
                      <NavLink
                        to="/user/new"
                        className="text-decoration-none color-main"
                      >
                        Create User
                      </NavLink>
                    </NavDropdown.Item>
                    <NavDropdown.Item as="div">
                      <NavLink
                        to="/project/new"
                        className="text-decoration-none color-main"
                      >
                        Create Project
                      </NavLink>
                    </NavDropdown.Item>
                    <NavDropdown.Item as="div">
                      <NavLink
                        to="/user"
                        className="text-decoration-none color-main"
                      >
                        Users
                      </NavLink>
                    </NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Item as="div">
                  <NavLink
                    to="/profile"
                    className="text-decoration-none color-main"
                  >
                    Profile
                  </NavLink>
                </NavDropdown.Item>
                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavBar;
