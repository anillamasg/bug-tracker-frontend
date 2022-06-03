import React, { useEffect, useState } from "react";
import { Card, Container, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Project() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState();
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

    fetch("http://project.bugtracker.com/project/allForUser", requestOptions, {
      signal: signal,
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });

    return () => {
      setProjects();
      controller.abort();
    };
  }, []);

  const handleProjectClick = (id) => {
    navigate(`/project/${id}`);
  };

  return (
    !loading && (
      <Container className="d-flex align-items-center project-container custom-container mt-4">
        <div className="w-100">
          <Card className="card-main">
            <Card.Body className="card-main-body">
              <Card.Title className="text-center">
                Available Projects
              </Card.Title>
              <Table responsive striped bordered hover className="w-100 mt-4">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Title</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, index) => {
                    return (
                      <tr
                        key={index}
                        onClick={() => {
                          handleProjectClick(project.id);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{index + 1}</td>
                        <td>{project.name}</td>
                        <td>{project.description}</td>
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

export default Project;
