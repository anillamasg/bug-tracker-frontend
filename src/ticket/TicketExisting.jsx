import React, { Fragment, useEffect, useState } from "react";
import { Card, Container, Table, Row, Col, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

const keyToWordMap = {
  title: "Title",
  description: "Description",
  assignee: "Assignee",
  dueDate: "Due Date",
  priority: "Priority",
  status: "Status",
  type: "Type",
  projectName: "Project Name",
};

function TicketExisting() {
  const authorizationHeader = useSelector(
    (state) => state.authorizationHeader.value
  );
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
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
        setLoading(false);
      });

    return () => {
      setTicket();
      controller.abort();
    };
  }, []);

  const handleDownloadFile = (e) => {
    const fileName = e.currentTarget.innerText;
    fetch(
      `http://ticket.bugtracker.com/ticket/downloadAttachment/${ticketId}&${fileName}`,
      {
        method: "GET",
        headers: {
          Authorization: authorizationHeader,
        },
      }
    )
      .then((res) => {
        return res.blob();
      })
      .then((data) => {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(data);
        a.download = fileName;
        a.click();
      });
  };

  return (
    !loading && (
      <Container className="d-flex align-items-center profile-container custom-container mt-4">
        <div className="w-100">
          <Card className="card-main">
            <Card.Body className="card-main-body">
              <Row>
                <Col sm="3">
                  <Card.Title>
                    {ticket.type} #{ticket.id}
                  </Card.Title>
                </Col>
                <Col sm="9" className="ps-2">
                  <Card.Title>{ticket.title}</Card.Title>
                </Col>
              </Row>
              <Row>
                <Col sm="3">
                  <Card.Text>
                    <b>Description</b>
                  </Card.Text>
                </Col>
                <Col sm="9" className="ps-2">
                  <Card.Text>{ticket.description}</Card.Text>
                </Col>
              </Row>
              <Table size="sm" className="w-100 mt-4 mb-0 ticket-table">
                <tbody>
                  <tr>
                    <td>
                      <b>Project:</b>
                    </td>
                    <td>{ticket.projectName}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Assignee:</b>
                    </td>
                    <td>{ticket.assignee}</td>
                    <td className="text-end">
                      <b>Assigned By:</b>
                    </td>
                    <td className="text-end">{ticket.assignedBy}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Due Date:</b>
                    </td>
                    <td>{ticket.dueDate}</td>
                    <td className="text-end">
                      <b>Created Date:</b>
                    </td>
                    <td className="text-end">{ticket.createdDate}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Status:</b>
                    </td>
                    <td>{ticket.status}</td>
                    <td className="text-end">
                      <b>Priority:</b>
                    </td>
                    <td className="text-end">{ticket.priority}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Type:</b>
                    </td>
                    <td>{ticket.type}</td>
                    <td className="text-end">
                      <b>Created By:</b>
                    </td>
                    <td className="text-end">{ticket.createdBy}</td>
                  </tr>
                  {ticket.fileNames !== undefined && ticket.fileNames !== [] && (
                    <tr>
                      <td>
                        <b>Attached Files:</b>
                      </td>
                      <td>
                        {ticket.fileNames.map((attachment, index) => {
                          return (
                            <div
                              key={index}
                              onClick={handleDownloadFile}
                              className="hyperlink"
                            >
                              {attachment}
                            </div>
                          );
                        })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {ticket.comments !== undefined &&
                ticket.comments !== null &&
                ticket.comments.map((comment, index) => {
                  return (
                    <Fragment key={index}>
                      <Card.Text className="mt-0.5 mb-0">
                        <b>Comments:</b>
                      </Card.Text>
                      <Card className="card-comment mt-1">
                        <Card.Body>
                          <Card.Text as="div">
                            <b>Updated By: </b>&emsp;&emsp;
                            <i>
                              {comment.updatedBy} on {comment.updatedDate}
                            </i>
                            <Table
                              responsive
                              size="sm"
                              borderless
                              className="w-50 mt-2 mb-2 font-size-point9"
                            >
                              <tbody>
                                {comment.action !== undefined &&
                                  comment.action !== null &&
                                  Object.keys(comment.action).map(
                                    (act, index) => {
                                      return (
                                        act !== "id" &&
                                        act !== "comment" &&
                                        comment.action[act] !== null && (
                                          <tr key={index}>
                                            <td className="w-25 p-0">
                                              {keyToWordMap[act]}:&nbsp;
                                            </td>
                                            <td className="p-0">
                                              {comment.action[act]}
                                            </td>
                                          </tr>
                                        )
                                      );
                                    }
                                  )}
                                {comment.attachments !== undefined &&
                                  comment.attachments.length !== 0 && (
                                    <tr>
                                      <td className="w-25 p-0">
                                        Attachments:&nbsp;
                                      </td>
                                      {comment.attachments.map(
                                        (attachment, index) => {
                                          return (
                                            <td className="p-0" key={index}>
                                              <span
                                                className="hyperlink"
                                                onClick={handleDownloadFile}
                                              >
                                                {attachment}
                                              </span>
                                            </td>
                                          );
                                        }
                                      )}
                                    </tr>
                                  )}
                              </tbody>
                            </Table>
                            {comment.updatedComment}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Fragment>
                  );
                })}

              <Row className="justify-content-end mt-3 mb-4">
                <Col sm="2">
                  <Link
                    to={`/ticket/update/${ticketId}`}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <Button
                      disabled={loading}
                      className="w-100 background-color-main"
                    >
                      Update
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </Container>
    )
  );
}

export default TicketExisting;
