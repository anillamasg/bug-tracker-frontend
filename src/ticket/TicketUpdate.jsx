import React, { useEffect, useState, useRef } from "react";
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
import { useNavigate, useParams } from "react-router-dom";

function TicketUpdate() {
  const { ticketId } = useParams();
  const userDetails = useSelector((state) => state.userDetails.value);
  const authorizationHeader = useSelector(
    (state) => state.authorizationHeader.value
  );

  const fileRef = useRef();
  const commentsRef = useRef();

  const [validated, setValidated] = useState(false);

  const [ticket, setTicket] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectValues, setProjectValues] = useState([]);
  const [typeValues, setTypeValues] = useState([]);
  const [assigneeValues, setAssigneeValues] = useState([]);
  const [priorityValues, setPriorityValues] = useState([]);
  const [statusValues, setStatusValues] = useState([]);
  const [attachmentNames, setAttachmentNames] = useState([]);
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [assigneeId, setAssigneeId] = useState();
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

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

    setLoading(true);

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
        let projects = [];
        for (const project of data) {
          delete project["createdDate"];
          delete project["description"];
          projects.push(project);
        }
        setProjectValues(projects);
      })
      .then(() => {
        fetch(
          `http://ticket.bugtracker.com/ticket/${ticketId}`,
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
            setTicket(data);
            setProjectName(data.projectName);
            setProjectId(data.projectId);
            setTitle(data.title);
            setDescription(data.description);
            setType(data.type);
            setAssignee(data.assignee);
            setAssigneeId(data.assigneeId);
            setStatus(data.status);
            setPriority(data.priority);
            setDueDate(data.dueDate);
            return data;
          })
          .then((data) => {
            fetch(
              `http://authentication.bugtracker.com/allByProject/${data.projectId}`,
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
              .then((respData) => {
                let users = [];
                for (const user of respData) {
                  delete user["role"];
                  delete user["username"];
                  users.push(user);
                }
                setAssigneeValues(users);
                setAssigneeId(data.assigneeId);
                setLoading(false);
              });
          });
      });

    return () => {
      setTicket();
      setError();
      setLoading();
      setProjectValues();
      setTypeValues();
      setAssigneeValues();
      setPriorityValues();
      setStatusValues();
      setAttachmentNames();
      setProjectName();
      setProjectId();
      setTitle();
      setDescription();
      setType();
      setAssigneeId();
      setAssignee();
      setStatus();
      setPriority();
      setDueDate();
      controller.abort();
    };
  }, []);

  const handleAssigneeChange = (e) => {
    const assigId = e.target.value;
    setAssigneeId(assigId);

    for (const assig of assigneeValues) {
      if (assig.id == assigId) {
        setAssignee(assig.name);
        break;
      }
    }
  };

  const handleProjectChange = (e) => {
    const projId = e.target.value;
    setProjectId(projId);

    for (const project of projectValues) {
      if (project.id == projId) {
        setProjectName(project.name);
        break;
      }
    }

    fetch(`http://authentication.bugtracker.com/allByProject/${projId}`, {
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

      const newTicket = {
        id: ticketId,
        title: title,
        description: description,
        assigneeId: assigneeId,
        assignee: assignee,
        assignedBy: userDetails.name,
        dueDate: dueDate,
        priority: priority,
        status: status,
        type: type,
        projectId: projectId,
        projectName: projectName,
      };

      let actions = {};

      const actionVariables = [
        "title",
        "description",
        "assignee",
        "dueDate",
        "priority",
        "status",
        "type",
        "projectName",
      ];

      for (const actionKey of actionVariables) {
        if (ticket[actionKey] !== newTicket[actionKey]) {
          actions[actionKey] = newTicket[actionKey];
        }
      }

      const comment = {
        updatedBy: userDetails.name,
        updatedDate: new Date().toISOString().slice(0, 10),
        attachments: attachmentNames,
        action: actions,
        updatedComment:
          commentsRef.current.value !== undefined
            ? commentsRef.current.value
            : "",
      };

      newTicket.comment = comment;

      fetch("http://ticket.bugtracker.com/ticket", {
        method: "PUT",
        headers: {
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTicket),
      }).then(() => {
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

    fetch(`http://ticket.bugtracker.com/ticket/uploadAttachment/${ticketId}`, {
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

  function handleReset() {
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
                Update Ticket
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
                          required
                          defaultValue={projectId}
                          onChange={handleProjectChange}
                        >
                          <option disabled value="">
                            -- Choose Project --
                          </option>
                          {projectValues.map((project, index) => {
                            return (
                              <option value={project.id} key={index}>
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
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          required
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
                          value={assigneeId}
                          onChange={handleAssigneeChange}
                          required
                        >
                          <option disabled value="">
                            -- Choose Assignee --
                          </option>
                          {assigneeValues.map((assignee, index) => {
                            return (
                              <option value={assignee.id} key={index}>
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
                          aria-label="Ticket Status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          required
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
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          required
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
                        <Form.Control
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          required
                        />
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

                <Form.Group as={Row} id="comments" className="mt-2">
                  <Form.Label column sm="2">
                    Comments:
                  </Form.Label>
                  <Col sm="10">
                    <Form.Control
                      as="textarea"
                      placeholder="Comments..."
                      ref={commentsRef}
                      defaultValue=""
                    />
                  </Col>
                </Form.Group>

                <Row className="justify-content-end mt-5 mb-4">
                  <Col sm="2">
                    <Button
                      disabled={loading}
                      className="w-100 background-color-main"
                      type="submit"
                    >
                      Update
                    </Button>
                  </Col>
                  <Col sm="2" className="ps-0">
                    <Button
                      disabled={loading}
                      className="w-100"
                      variant="secondary"
                      onClick={handleReset}
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

export default TicketUpdate;
