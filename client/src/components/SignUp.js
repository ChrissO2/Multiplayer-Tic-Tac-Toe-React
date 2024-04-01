import React, { useState } from "react";
import Axios from "axios";
import Cookies from "universal-cookie";
import { backend_url } from "../api_utils";

function SignUp({ setIsAuth }) {
  const cookies = new Cookies();
  const [user, setUser] = useState(null);

  const signUp = () => {
    Axios.post(backend_url + '/signup', user).then((res) => {
      console.log('request url: ', backend_url + '/signup');
      const { token, userId, firstName, lastName, username, hashedPassword } =
        res.data;
      cookies.set("token", token);
      cookies.set("userId", userId);
      cookies.set("username", username);
      cookies.set("firstName", firstName);
      cookies.set("lastName", lastName);
      cookies.set("hashedPassword", hashedPassword);
      setIsAuth(true);
    }).catch((err) => {
      console.log('request url: ', backend_url + '/signup');
      console.log(err);
    });
  };
  return (
    <div className="signUp">
      <label> Sign Up</label>
      <input
        placeholder="First Name"
        onChange={(event) => {
          setUser({ ...user, firstName: event.target.value });
        }}
      />
      <input
        placeholder="Last Name"
        onChange={(event) => {
          setUser({ ...user, lastName: event.target.value });
        }}
      />
      <input
        placeholder="Username"
        onChange={(event) => {
          setUser({ ...user, username: event.target.value });
        }}
      />
      <input
        placeholder="Password"
        type="password"
        onChange={(event) => {
          setUser({ ...user, password: event.target.value });
        }}
      />
      <button onClick={signUp}> Sign Up</button>
    </div>
  );
}

export default SignUp;
