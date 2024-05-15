const express = require("express");
const cors = require("cors");
const { StreamChat } = require("stream-chat");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const AWS = require("aws-sdk");
const { CognitoUserPool, CognitoUserAttribute, AuthenticationDetails, CognitoUser } = require('amazon-cognito-identity-js');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const bodyParser = require('body-parser')



const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());
const api_key = "5u5qsty97bup";
const api_secret =
  "wsje43g67n6sfkr98czdxymdgy92kux33qks9ye6vfdsqv3vhjy96me9g8k2xs4w";
// const api_key = process.env.API_KEY;
// const api_secret = process.env.API_SECRET;
const serverClient = StreamChat.getInstance(api_key, api_secret);

const poolData = {
  UserPoolId : "us-east-1_Gg858zqYR",
  ClientId : "7s7a8gjso25317s2n5n73ib328"
};

const userPool = new CognitoUserPool(poolData);


const awsSignUp = async (username, password, email) => {
  return new Promise((resolve, reject) => {
    const attributeList = [];
    const dataEmail = {
        Name : 'email',
        Value : email
    };
    const attributeEmail = new CognitoUserAttribute(dataEmail);
    attributeList.push(attributeEmail);
    userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
            console.log(err);
            reject(err);
            return;
        }
        const cognitoUser = result.user;
        console.log('New user cognitoUser: ' + cognitoUser.getUsername());
        resolve(cognitoUser);
    });
  });
}

const awsSignIn = (username, password) => {
  const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password
  });

  const userData = {
      Username: username,
      Pool: userPool
  };

  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function (result) {
              const accessToken = result.getAccessToken().getJwtToken();
              const refreshToken = result.getRefreshToken().getToken();
              resolve({accessToken, refreshToken});
          },
          onFailure: function (err) {
              console.log(err);
              reject(err);
          }
      });
  });
}


app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, username, password, email } = req.body;
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = serverClient.createToken(userId);
    serverClient.upsertUser({
      id: userId,
      name: username,
      firstName,
      lastName,
      hashedPassword,
    })
    const cognitoUser = await awsSignUp(username, password, email);
    cognitoUserName = cognitoUser.getUsername();
    if (!cognitoUser) {
      return res.json({ message: "Error signing up" });
    }
    res.json({ token, userId, firstName, lastName, username, hashedPassword, cognitoUserName });
  } catch (error) {
    res.json(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    // res.header("Access-Control-Allow-Origin", "*");
    const { username, password } = req.body;
    const { users } = await serverClient.queryUsers({ name: username });
    if (users.length === 0)
    {
      console.log('User not found');
      return res.json({ message: "User not found" });
    }

    const token = serverClient.createToken(users[0].id);
    const passwordMatch = await bcrypt.compare(
      password,
      users[0].hashedPassword
    );
    
    var awsAccessToken = '';
    var awsRefreshToken = '';
    await awsSignIn(username, password).then(({accessToken, refreshToken}) => {
      awsAccessToken = accessToken;
      awsRefreshToken = refreshToken;
    }).catch((err) => {
      console.log('awsSignIn err: ', err);
    });

    if (passwordMatch && awsAccessToken.length > 0) {
      res.json({
        token,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        username,
        userId: users[0].id,
        awsAccessToken,
        awsRefreshToken
      });
    }
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

app.post("/verify", async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: "Access token is required" });
    }

    const jwksClient = require('jwks-rsa');
    const jwksUri = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Gg858zqYR/.well-known/jwks.json';

    const client = jwksClient({
      jwksUri
    });

    const getSigningKey = (header, callback) => {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          console.error('Error getting signing key:', err);
          return callback(err);
        }
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      });
    };

    jwt.verify(accessToken, getSigningKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(401).json({ message: "Invalid token" });
      } else {
        console.log('Decoded token:', decoded);
        return res.status(200).json({ message: "Token verified successfully", decoded });
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
