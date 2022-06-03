import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Table,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function ProjectExisting() {
  const navigate = useNavigate();
  const authorizationHeader = useSelector(
    (state) => state.authorizationHeader.value
  );
  const role = useSelector((state) => state.userDetails.value.role);

  const [error, setError] = useState();
  const [validatedProvide, setValidatedProvide] = useState(false);
  const [validatedRevoke, setValidatedRevoke] = useState(false);
  const [project, setProject] = useState({});
  const [loading, setLoading] = useState(true);
  const [usersWithAccess, setUsersWithAccess] = useState([]);
  const [usersWithoutAccess, setUsersWithoutAccess] = useState([]);
  const [tickets, setTickets] = useState({});
  const { projectId } = useParams();

  const provideRef = useRef();
  const revokeRef = useRef();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetch(
      `http://project.bugtracker.com/project/${projectId}`,
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
        setProject(data);
        if (role !== "admin") setLoading(false);
        // setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });

    if (role === "admin") {
      fetch(
        `http://authentication.bugtracker.com/allWithoutProject/${projectId}`,
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
          setUsersWithoutAccess(data);
          // setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });

      fetch(
        `http://authentication.bugtracker.com/allByProject/${projectId}`,
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
          data.splice(
            data.findIndex((user) => {
              return user.role === "admin";
            }),
            1
          );

          setUsersWithAccess(data);
        })
        .catch((err) => {
          console.log(err);
        });

      fetch(
        `http://ticket.bugtracker.com/ticket/byProject/${projectId}`,
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
          setTickets(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    return () => {
      setError();
      setValidatedProvide();
      setValidatedRevoke();
      setProject();
      setLoading();
      setUsersWithAccess();
      setUsersWithoutAccess();
      setTickets();

      controller.abort();
    };
  }, []);

  const handleProvideAccess = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      const requestData = {
        userId: provideRef.current.value,
        projectId: projectId,
      };

      const requestOptions = {
        method: "POST",
        headers: {
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      };

      fetch(
        "http://project.bugtracker.com/project/provideAccess",
        requestOptions
      )
        .then((response) => {
          response.status === 200
            ? navigate("/project")
            : setError("Failed to provide access");
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    setValidatedProvide(true);
  };

  const handleRevokeAccess = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      const requestData = {
        userId: revokeRef.current.value,
        projectId: projectId,
      };

      const requestOptions = {
        method: "POST",
        headers: {
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      };

      fetch(
        "http://project.bugtracker.com/project/revokeAccess",
        requestOptions
      )
        .then((response) => {
          response.status === 200
            ? navigate("/project")
            : setError("Failed to provide access");
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    setValidatedRevoke(true);
  };

  const handleTicketClick = (id) => {
    navigate(`/ticket/${id}`);
  };

  return (
    !loading && (
      <Container className="d-flex align-items-center profile-container custom-container mt-4">
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="w-100">
          <Card className="card-main">
            <Card.Body className="card-main-body">
              <Row>
                <Col sm="3">
                  <Card.Title>Name</Card.Title>
                </Col>
                <Col sm="9" className="ps-2">
                  <Card.Title>{project.name}</Card.Title>
                </Col>
              </Row>
              <Row>
                <Col sm="3">
                  <Card.Text>
                    <b>Description</b>
                  </Card.Text>
                </Col>
                <Col sm="9" className="ps-2">
                  <Card.Text>{project.description}</Card.Text>
                </Col>
              </Row>

              {role === "admin" && (
                <>
                  {" "}
                  <br />
                  <Form
                    noValidate
                    validated={validatedProvide}
                    onSubmit={handleProvideAccess}
                  >
                    <Form.Group as={Row} id="provideAccess">
                      <Form.Label column sm="3">
                        <b>Provide Access</b>
                      </Form.Label>
                      <Col sm="7" className="ps-2">
                        <Form.Select
                          aria-label="Access Assignee"
                          ref={provideRef}
                          required
                          defaultValue=""
                        >
                          <option disabled value="">
                            -- Choose Assignee --
                          </option>
                          {usersWithoutAccess.map((user) => {
                            return (
                              <option value={user.id} key={user.id}>
                                {user.name}
                              </option>
                            );
                          })}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          Select Assignee.
                        </Form.Control.Feedback>
                      </Col>
                      <Col sm="2" className="ps-2">
                        <Button
                          disabled={loading}
                          className="w-100 background-color-secondary border-none"
                          type="submit"
                        >
                          Provide
                        </Button>
                      </Col>
                    </Form.Group>
                  </Form>
                  <Form
                    noValidate
                    validated={validatedRevoke}
                    onSubmit={handleRevokeAccess}
                    className="mt-2"
                  >
                    <Form.Group as={Row} id="revokeAccess">
                      <Form.Label column sm="3">
                        <b>Revoke Access</b>
                      </Form.Label>
                      <Col sm="7" className="ps-2">
                        <Form.Select
                          aria-label="Access Assignee"
                          ref={revokeRef}
                          required
                          defaultValue=""
                        >
                          <option disabled value="">
                            -- Choose Assignee --
                          </option>
                          {usersWithAccess.map((user) => {
                            return (
                              <option value={user.id} key={user.id}>
                                {user.name}
                              </option>
                            );
                          })}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          Select Assignee.
                        </Form.Control.Feedback>
                      </Col>
                      <Col sm="2" className="ps-2">
                        <Button
                          disabled={loading}
                          className="w-100 background-color-tertiary border-none"
                          type="submit"
                        >
                          Revoke
                        </Button>
                      </Col>
                    </Form.Group>
                  </Form>
                  <Table
                    responsive
                    striped
                    bordered
                    hover
                    className="w-100 mt-5"
                    id="ticketsTable"
                  >
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Ticket</th>
                        <th>Assignee</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Title</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket, index) => {
                        return (
                          <tr
                            key={index}
                            onClick={() => {
                              handleTicketClick(ticket.id);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <td>{index + 1}</td>
                            <td>
                              {ticket.type} #{ticket.id}
                            </td>
                            <td>{ticket.assignee}</td>
                            <td>{ticket.priority}</td>
                            <td>{ticket.status}</td>
                            <td>{ticket.title}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </Container>
    )
  );
}

export default ProjectExisting;
