import React, { useEffect, useState } from "react";
import { Card, Container, Table } from "react-bootstrap";
import { useSelector } from "react-redux";

function User() {
  const [users, setUsers] = useState();
  const [loading, setLoading] = useState(true);
  const authorizationHeader = useSelector(
    (state) => state.authorizationHeader.value
  );

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
      "http://authentication.bugtracker.com/all",
      requestOptions,
      {
        signal: signal,
      }
    );

    fetchPromise
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });

    return () => {
      setUsers();
      setLoading();
      controller.abort();
    };
  }, []);

  return (
    !loading && (
      <Container className="d-flex align-items-center project-container custom-container mt-4">
        <div className="w-100">
          <Card className="card-main">
            <Card.Body className="card-main-body">
              <Card.Title className="text-center">Users</Card.Title>
              <Table responsive striped bordered hover className="w-100 mt-4">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.username}</td>
                        <td>{user.role}</td>
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

export default User;
