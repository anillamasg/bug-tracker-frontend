import React, { useEffect, useState } from "react";
import { Card, Container } from "react-bootstrap";
import { Person } from "react-bootstrap-icons";
import { useSelector } from "react-redux";

function Profile() {
  const authorizationHeader = useSelector(
    (state) => state.authorizationHeader.value
  );

  const [profile, setProfile] = useState({});
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

    fetch(`http://profile.bugtracker.com/profile`, requestOptions, {
      signal: signal,
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
    return () => {
      setProfile();
      controller.abort();
    };
  }, []);
  return (
    !loading && (
      <Container
        className="d-flex align-items-center profile-container custom-container mt-4"
        style={{ height: "80vh" }}
      >
        <Card className="card-main w-100">
          <Card.Body
            className="card-main-body d-flex align-items-center"
            style={{ flexDirection: "column" }}
          >
            <h2>Profile</h2>
            <Person className="color-main" size={384} />
            <Card.Title className="mt-4">
              <b>Name:&emsp;&emsp;&emsp;&emsp;&emsp;</b>
              {profile.name} <br />
              <b>Email: &emsp;&emsp;&emsp;&emsp;&emsp;</b>
              {profile.email}
            </Card.Title>
          </Card.Body>
        </Card>
      </Container>
    )
  );
}

export default Profile;
