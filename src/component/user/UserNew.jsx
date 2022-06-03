import React, { useState, useRef } from "react";
import {
  Card,
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function UserNew() {
  const authorizationHeader = useSelector(
    (state) => state.authorizationHeader.value
  );
  const [validated, setValidated] = useState(false);

  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const roleRef = useRef();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      const user = {
        name: nameRef.current.value,
        email: emailRef.current.value,
        password: passwordRef.current.value,
        role: roleRef.current.value,
      };

      const requestOptions = {
        method: "POST",
        headers: {
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      };

      let responseStatus = false;

      await fetch("http://authentication.bugtracker.com/create", requestOptions)
        .then((response) => {
          responseStatus = response.status;
        })
        .catch((err) => {
          console.log(err);
        });

      responseStatus === 200
        ? navigate("/user")
        : setError("Failed to create user");
      setLoading(false);
    }

    setValidated(true);
  };

  return (
    <Container className="d-flex align-items-center profile-container custom-container mt-4">
      <div className="w-100">
        <Card className="card-main">
          <Card.Body className="card-main-body">
            <Card.Title className="text-center mb-4">
              Create a New User
            </Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group as={Row} id="name" className="mt-2">
                <Form.Label column sm="2">
                  Name:
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    type="text"
                    placeholder="Name..."
                    ref={nameRef}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Provide a name.
                  </Form.Control.Feedback>
                </Col>
              </Form.Group>
              <Form.Group as={Row} id="email" className="mt-2">
                <Form.Label column sm="2">
                  Email:
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    type="email"
                    placeholder="Email..."
                    ref={emailRef}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Provide an email.
                  </Form.Control.Feedback>
                </Col>
              </Form.Group>
              <Form.Group as={Row} id="description" className="mt-2">
                <Form.Label column sm="2">
                  Password:
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    type="password"
                    placeholder="Password..."
                    ref={passwordRef}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Provide a password.
                  </Form.Control.Feedback>
                </Col>
              </Form.Group>
              <Form.Group as={Row} id="role" className="mt-2">
                <Form.Label column sm="2">
                  Role:
                </Form.Label>
                <Col sm="10">
                  <Form.Select
                    aria-label="Ticket type"
                    ref={roleRef}
                    required
                    defaultValue=""
                  >
                    <option disabled value="">
                      -- Choose Ticket Type --
                    </option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Select Ticket Type.
                  </Form.Control.Feedback>
                </Col>
              </Form.Group>

              <Row className="justify-content-end mt-5 mb-4">
                <Col sm="2">
                  <Button
                    disabled={loading}
                    className="w-100 background-color-main"
                    type="submit"
                  >
                    Create
                  </Button>
                </Col>
                <Col sm="2" className="ps-0">
                  <Button
                    disabled={loading}
                    className="w-100"
                    variant="secondary"
                    type="reset"
                    // onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default UserNew;
