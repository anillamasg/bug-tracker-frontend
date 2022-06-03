import React from "react";
import { Container, Card } from "react-bootstrap";
import { ExclamationCircle } from "react-bootstrap-icons";

function Error() {
  return (
    <Container
      className="d-flex align-items-center error-container custom-container mt-4"
      style={{ height: "80vh" }}
    >
      <Card className="card-main w-100">
        <Card.Body
          className="card-main-body d-flex align-items-center"
          style={{ flexDirection: "column" }}
        >
          <ExclamationCircle className="color-main" size={384} />
          <Card.Title className="mt-4">404. That’s an error.</Card.Title>
          <Card.Text>
            The requested resource was not found on our server. That’s all we
            know.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Error;
