import React, { useState } from "react";
import Axios from "axios";
import Cookies from "universal-cookie";

function Login({ setIsAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const backend_url = process.env.BACKEND_URL;

  const cookies = new Cookies();
  const login = () => {
    Axios.post(backend_url, {
      username,
      password,
    }).then((res) => {
      const { firstName, lastName, username, token, userId } = res.data;
      if (token) {
        cookies.set("token", token);
        cookies.set("userId", userId);
        cookies.set("username", username);
        cookies.set("firstName", firstName);
        cookies.set("lastName", lastName);
        setIsAuth(true);
      } else {
        alert("Bad credidentials");
      }
    })
    .catch((err) => {
      alert("Error logging in");
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
