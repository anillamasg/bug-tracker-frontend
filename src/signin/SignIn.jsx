import React, { useRef, useState } from "react";
import { Card, Form, Button, Alert, Container, Navbar } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { setAuthorizationHeader } from "../reducer/authorizationHeaderSlice";
import { setUserDetails } from "../reducer/userDetailsSlice";

function SignIn() {
  const emailRef = useRef();
  const passwordRef = useRef();

  //   const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: emailRef.current.value,
        password: passwordRef.current.value,
      }),
    };

    let responseStatus = false;
    let authorizationHeader = "";
    let userDetails;

    await fetch("http://authentication.bugtracker.com/login", requestOptions)
      .then((response) => {
        responseStatus = response.status;
        return response.json();
      })
      .then((data) => {
        authorizationHeader = data.Authorization ? data.Authorization : "";
        userDetails = { id: data.id, name: data.name, role: data.role };
      })
      .catch((err) => {
        console.log(err);
      });

    if (responseStatus === 200 && authorizationHeader !== "") {
      dispatch(setAuthorizationHeader(authorizationHeader));
      dispatch(setUserDetails(userDetails));
      navigate("/");
    } else {
      setError("Failed to sign in.");
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar className="bg-main" expand="lg">
        <Container>
          <Navbar.Brand className="font-white">
            <NavLink to="/" style={{ textDecoration: "none", color: "white" }}>
              BUG TRACKER
            </NavLink>
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "90vh" }}
      >
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Log In</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" ref={emailRef} required />
                </Form.Group>
                <Form.Group className="mt-2" id="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" ref={passwordRef} required />
                </Form.Group>
                <Button
                  disabled={loading}
                  className="w-100 mt-4 background-color-main"
                  type="submit"
                >
                  Login
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
}

export default SignIn;
