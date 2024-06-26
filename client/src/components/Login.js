import React, { useState } from "react";
import Axios from "axios";
import Cookies from "universal-cookie";
import { backend_url } from "../api_utils";

function Login({ setIsAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const cookies = new Cookies();
  const login = () => {
    Axios.post('http://' + window.location.hostname + ':3001/login', {
      username,
      password,
    }).then((res) => {
      console.log('res.data: ', res.data);
      const { firstName, lastName, username, token, userId, awsAccessToken, awsRefreshToken } = res.data;
      if (token && awsAccessToken) {
        cookies.set("token", token);
        cookies.set("userId", userId);
        cookies.set("username", username);
        cookies.set("firstName", firstName);
        cookies.set("lastName", lastName);
        cookies.set("awsAccessToken", awsAccessToken);
        cookies.set("awsRefreshToken", awsRefreshToken);
        setIsAuth(true);
      } else {
        alert("Bad credidentials");
      }
    })
    .catch((err) => {
      alert("Error logging in");
      console.log(err);
    });
  };
  return (
    <div className="login">
      <label> Login</label>

      <input
        placeholder="Username"
        onChange={(event) => {
          setUsername(event.target.value);
        }}
      />
      <input
        placeholder="Password"
        type="password"
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />
      <button onClick={login}> Login</button>
    </div>
  );
}

export default Login;
