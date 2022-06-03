import React, { useEffect, useRef, useState } from "react";
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

function TicketNew() {
  const userDetails = useSelector((state) => state.userDetails.value);
  const authorizationHeader = useSelector(
    (state) => state.authorizationHeader.value
  );
  const [validated, setValidated] = useState(false);

  const projectRef = useRef();
  const titleRef = useRef();
  const descriptionRef = useRef();
  const typeRef = useRef();
  const assigneeRef = useRef();
  const statusRef = useRef();
  const priorityRef = useRef();
  const dueDateRef = useRef();
  const fileRef = useRef();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectValues, setProjectValues] = useState([]);
  const [typeValues, setTypeValues] = useState([]);
  const [assigneeValues, setAssigneeValues] = useState([]);
  const [priorityValues, setPriorityValues] = useState([]);
  const [statusValues, setStatusValues] = useState([]);
  const [attachmentNames, setAttachmentNames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);
    const typeValues = ["Bug", "Enhancement", "Feature"];
    const prioritiesValues = ["Low", "Medium", "High"];
    const statusValues = [
      "New",
      "In Progress",
      "Resolved",
      "Verified",
      "Rejected",
    ];

    setTypeValues(typeValues);
    setPriorityValues(prioritiesValues);
    setStatusValues(statusValues);

    fetch(
      "http://project.bugtracker.com/project/allForUser",
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
        setProjectValues(data);
        setLoading(false);
      });

    return () => {
      setError();
      setLoading();
      setProjectValues();
      setTypeValues();
      setAssigneeValues();
      setPriorityValues();
      setStatusValues();
      setAttachmentNames();
      controller.abort();
    };
  }, []);

  const handleProjectChange = () => {
    const project = JSON.parse(projectRef.current.value);

    fetch(`http://authentication.bugtracker.com/allByProject/${project.id}`, {
      method: "GET",
      headers: {
        Authorization: authorizationHeader,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let users = [];
        for (const user of data) {
          delete user["role"];
          delete user["username"];
          users.push(user);
        }
        setAssigneeValues(users);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      setLoading(true);
      const project = JSON.parse(projectRef.current.value);
      const assignee = JSON.parse(assigneeRef.current.value);

      const ticket = {
        title: titleRef.current.value,
        description: descriptionRef.current.value,
        assigneeId: assignee.id,
        assignee: assignee.name,
        assignedBy: userDetails.name,
        createdBy: userDetails.name,
        dueDate: dueDateRef.current.value,
        priority: priorityRef.current.value,
        status: statusRef.current.value,
        type: typeRef.current.value,
        attachedFiles: attachmentNames,
        projectId: project.id,
        projectName: project.name,
      };

      fetch("http://ticket.bugtracker.com/ticket/create", {
        method: "POST",
        headers: {
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticket),
      })
        .then((response) => {
          return response.json();
        })
        .then((ticketId) => {
          navigate(`/ticket/${ticketId}`);
          setLoading(false);
        });
    }

    setValidated(true);
  };

  function handleUpload(e) {
    e.preventDefault();

    if (fileRef.current.value === null) {
      setError("No files chosen.");
      return;
    }

    const formData = new FormData();
    formData.append("files", fileRef.current.files[0]);

    fetch(`http://ticket.bugtracker.com/ticket/uploadAttachment/0`, {
      method: "POST",
      headers: {
        Authorization: authorizationHeader,
      },
      body: formData,
    })
      .then((response) => {
        return response.json();
      })
      .then(() => {
        setAttachmentNames((names) => [
          ...names,
          fileRef.current.files[0].name,
        ]);
        fileRef.current.value = null;
      });
  }

  function removeParentDiv(e) {
    const value = e.currentTarget.parentNode.querySelector(".ms-2").innerText;
    const index = attachmentNames.indexOf(value);
    if (index > -1) {
      attachmentNames.splice(index, 1);
    }

    e.currentTarget.parentNode.remove();
  }

  function handleCancel() {
    fileRef.current.value = null;
    setAttachmentNames([]);
  }

  return (
    !loading && (
      <Container className="d-flex align-items-center profile-container custom-container mt-4">
        <div className="w-100">
          <Card className="card-main">
            <Card.Body className="card-main-body">
              <Card.Title className="text-center mb-4">
                Create a New Ticket
              </Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <Col sm="6">
                    <Form.Group as={Row}>
                      <Form.Label column sm="4">
                        Project:
                      </Form.Label>
                      <Col sm="7">
                        <Form.Select
                          aria-label="Project Name"
                          ref={projectRef}
                          required
                          defaultValue=""
                          onChange={handleProjectChange}
                        >
                          <option disabled value="">
                            -- Choose Project --
                          </option>
                          {projectValues.map((project, index) => {
                            return (
                              <option
                                value={JSON.stringify(project)}
                                key={index}
                              >
                                {project.name}
                              </option>
                            );
                          })}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          Choose a project.
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group as={Row} id="title" className="mt-2">
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
                <Row className="mb-1 mt-2">
                  <Col sm="6">
                    <Form.Group as={Row}>
                      <Form.Label column sm="4">
                        Type:
                      </Form.Label>
                      <Col sm="7">
                        <Form.Select
                          aria-label="Ticket type"
                          ref={typeRef}
                          required
                          defaultValue=""
                        >
                          <option disabled value="">
                            -- Choose Ticket Type --
                          </option>
                          {typeValues.map((type) => {
                            return (
                              <option value={type} key={type}>
                                {type}
                              </option>
                            );
                          })}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          Select Ticket Type.
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                  </Col>
                  <Col sm="6">
                    <Form.Group
                      as={Row}
                      className="justify-content-end"
                      id="assignee"
                    >
                      <Form.Label column sm="4">
                        Assignee:
                      </Form.Label>
                      <Col sm="7">
                        <Form.Select
                          aria-label="Assignee"
                          ref={assigneeRef}
                          required
                          defaultValue=""
                        >
                          <option disabled value="">
                            -- Choose Assignee --
                          </option>
                          {assigneeValues.map((assignee, index) => {
                            return (
                              <option
                                value={JSON.stringify(assignee)}
                                key={index}
                              >
                                {assignee.name}
                              </option>
                            );
                          })}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          Choose assignee.
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-1 mt-2">
                  <Col sm="6">
                    <Form.Group as={Row}>
                      <Form.Label column sm="4">
                        Status:
                      </Form.Label>
                      <Col sm="7">
                        <Form.Select
                          aria-label="Ticket status"
                          ref={statusRef}
                          required
                          defaultValue=""
                        >
                          <option disabled value="">
                            -- Choose Ticket Status --
                          </option>
                          {statusValues.map((s) => {
                            return (
                              <option value={s} key={s}>
                                {s}
                              </option>
                            );
                          })}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          Select Ticket Status.
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                  </Col>
                  <Col sm="6">
                    <Form.Group
                      as={Row}
                      className="justify-content-end"
                      id="priority"
                    >
                      <Form.Label column sm="4">
                        Priority:
                      </Form.Label>
                      <Col sm="7">
                        <Form.Select
                          aria-label="Priority"
                          ref={priorityRef}
                          required
                          defaultValue=""
                        >
                          <option disabled value="">
                            -- Choose Priority --
                          </option>
                          {priorityValues.map((priority) => {
                            return (
                              <option value={priority} key={priority}>
                                {priority}
                              </option>
                            );
                          })}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          Set Priority.
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-1 mt-2">
                  <Col sm="6">
                    <Form.Group as={Row}>
                      <Form.Label column sm="4">
                        Due Date:
                      </Form.Label>
                      <Col sm="7">
                        <Form.Control type="date" ref={dueDateRef} required />
                      </Col>
                    </Form.Group>
                    <Form.Control.Feedback type="invalid">
                      Pick a due date.
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row className="mb-1 mt-2">
                  <Col sm="6">
                    <Form.Group as={Row} className="d-flex align-items-center">
                      <Form.Label column sm="4">
                        Attachments:
                      </Form.Label>
                      <Col sm="7">
                        <Form.Control type="file" ref={fileRef} />
                      </Col>
                      <Col sm="1">
                        <Button
                          variant="primary"
                          type="submit"
                          className="background-color-main"
                          size="sm"
                          onClick={handleUpload}
                        >
                          Upload
                        </Button>
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-1 mt-2">
                  <Col sm="6">
                    <Form.Group as={Row}>
                      <Form.Label column sm="4"></Form.Label>
                      <Col sm="7" id="uploadedAttachments">
                        {attachmentNames.map((name, index) => {
                          return (
                            <div
                              className="d-flex align-items-center"
                              key={name + "" + index}
                            >
                              <Button
                                className="p-0 border-0"
                                aria-label="Close"
                                variant="light"
                                onClick={removeParentDiv}
                                style={{
                                  background: "none",
                                }}
                              >
                                <span aria-hidden="true">&times;</span>
                              </Button>
                              <span className="ms-2">{name}</span>
                            </div>
                          );
                        })}
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>

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
                      onClick={handleCancel}
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
    )
  );
}

export default TicketNew;
