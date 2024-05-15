import React, { useState } from "react";
import Axios from "axios";
import Cookies from "universal-cookie";
import { backend_url } from "../api_utils";

function SignUp() {
  const cookies = new Cookies();
  const [user, setUser] = useState(null);

  const signUp = () => {
    Axios.post(backend_url + '/signup', user).then((res) => {
      const { token, userId, firstName, lastName, username, hashedPassword, cognitoUserName } =
        res.data;

      console.log('res.data: ', res.data);
      
      if (token && cognitoUserName) {
        alert("Confirm your email");
      }
      else {
        alert("Bad credidentials");
      }
    }).catch((err) => {
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
        placeholder="Email"
        onChange={(event) => {
          setUser({ ...user, email: event.target.value });
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
