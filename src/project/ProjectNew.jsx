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

function ProjectNew() {
  const authorizationHeader = useSelector(
    (state) => state.authorizationHeader.value
  );
  const [validated, setValidated] = useState(false);

  const titleRef = useRef();
  const descriptionRef = useRef();

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
      setLoading(true);

      const project = {
        name: titleRef.current.value,
        description: descriptionRef.current.value,
      };

      const requestOptions = {
        method: "POST",
        headers: {
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      };

      let responseStatus;

      await fetch("http://project.bugtracker.com/project", requestOptions)
        .then((response) => {
          responseStatus = response.status;
        })
        .catch((err) => {
          console.log(err);
        });

      responseStatus === 200
        ? navigate("/project")
        : setError("Failed to create project");
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
              Create a New Project
            </Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group as={Row} id="email" className="mt-2">
                <Form.Label column sm="2">
                  Title:
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    type="text"
                    placeholder="Title..."
                    ref={titleRef}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Provide a title.
                  </Form.Control.Feedback>
                </Col>
              </Form.Group>
              <Form.Group as={Row} id="description" className="mt-2">
                <Form.Label column sm="2">
                  Description:
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    as="textarea"
                    placeholder="Description..."
                    ref={descriptionRef}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Provide a description.
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

export default ProjectNew;
