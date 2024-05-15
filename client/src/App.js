import "./App.css";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";
import Cookies from "universal-cookie";
import { useState } from "react";
import JoinGame from "./components/JoinGame";

const verifyToken = async (accessToken) => {
  const response = await fetch("http://localhost:3001/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessToken }),
  });
  const data = await response.json();
  alert(data.message);
}

function App() {
  const api_key = "5u5qsty97bup";
  const cookies = new Cookies();
  const token = cookies.get("token");
  const awsAccessToken = cookies.get("awsAccessToken");
  const awsRefreshToken = cookies.get("awsRefreshToken");
  const client = StreamChat.getInstance(api_key);
  const [isAuth, setIsAuth] = useState(false);
  const [needConfirmation, setNeedConfirmation] = useState(false);

  const logOut = () => {
    cookies.remove("token");
    cookies.remove("userId");
    cookies.remove("firstName");
    cookies.remove("lastName");
    cookies.remove("hashedPassword");
    cookies.remove("channelName");
    cookies.remove("username");
    cookies.remove("awsAccessToken");
    cookies.remove("awsRefreshToken");
    client.disconnectUser();
    setIsAuth(false);
  };

  if (token) {
    client
      .connectUser(
        {
          id: cookies.get("userId"),
          name: cookies.get("username"),
          firstName: cookies.get("firstName"),
          lastName: cookies.get("lastName"),
          hashedPassword: cookies.get("hashedPassword"),
        },
        token
      )
      .then((user) => {
        setIsAuth(true);
      });
  }
  return (
    <div className="App">
      {isAuth ? (
        <Chat client={client}>
          <JoinGame />
          <button className="buttonLogout" onClick={logOut}> Log Out</button>
        </Chat>
      ) : (
        <>
          <SignUp setIsAuth={setIsAuth} />
          <Login setIsAuth={setIsAuth} />
        </>
      )}
      {awsAccessToken &&
      <button onClick={() => {verifyToken(awsAccessToken)}}>verify token</button>}
      
    </div>
  );
}

export default App;
