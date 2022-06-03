import React, { useEffect, useState } from "react";
import { Card, Container, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Ticket() {
  const navigate = useNavigate();
  const userId = useSelector((state) => state.userDetails.value.id);
  const authorizationHeader = useSelector(
    (state) => state.authorizationHeader.value
  );

  const [tickets, setTickets] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    setLoading(true);
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: authorizationHeader,
        "Content-Type": "application/json",
      },
    };

    const fetchPromise = fetch(
      `http://ticket.bugtracker.com/ticket/byAssignee/${userId}`,
      requestOptions,
      { signal: signal }
    );

    fetchPromise
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
    return () => {
      setTickets();
      controller.abort();
    };
  }, []);

  const handleTicketClick = (id) => {
    navigate(`/ticket/${id}`);
  };

  return (
    !loading && (
      <Container className="d-flex align-items-center ticket-container custom-container mt-4">
        <div className="w-100">
          <Card className="card-main">
            <Card.Body className="card-main-body">
              <Card.Title className="text-center ">Assigned Tickets</Card.Title>
              <Table
                responsive
                striped
                bordered
                hover
                className="w-100 mt-4"
                id="ticketsTable"
              >
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Ticket</th>
                    <th>Project</th>
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
                        <td>{ticket.projectName}</td>
                        <td>{ticket.priority}</td>
                        <td>{ticket.status}</td>
                        <td>{ticket.title}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      </Container>
    )
  );
}

export default Ticket;
