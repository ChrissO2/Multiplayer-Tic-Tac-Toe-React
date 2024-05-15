const { CognitoUserPool, CognitoUserAttribute, AuthenticationDetails, CognitoUser, CognitoRefreshToken } = require('amazon-cognito-identity-js');

const poolData = {
  UserPoolId: "us-east-1_Gg858zqYR",
  ClientId: "7s7a8gjso25317s2n5n73ib328"
};

const userPool = new CognitoUserPool(poolData);

const awsSignUp = async (username, password, email) => {
  return new Promise((resolve, reject) => {
    const attributeList = [];
    const dataEmail = {
      Name: 'email',
      Value: email
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
        resolve({ accessToken, refreshToken });
      },
      onFailure: function (err) {
        console.log(err);
        reject(err);
      }
    });
  });
}

const awsRefreshTokenExchange = async (refreshToken) => {
    return new Promise((resolve, reject) => {
      const cognitoRefreshToken = new CognitoRefreshToken({ RefreshToken: refreshToken });
  
      const cognitoUser = userPool.getCurrentUser();
      console.log('cognitoUser: ', cognitoUser);
      if (cognitoUser) {
        cognitoUser.refreshSession(cognitoRefreshToken, (err, session) => {
          if (err) {
            console.error('Error refreshing session:', err);
            reject(err);
          } else {
            const accessToken = session.getAccessToken().getJwtToken();
            const idToken = session.getIdToken().getJwtToken();
            resolve({ accessToken, idToken });
          }
        });
      } else {
        reject(new Error("No user found"));
      }
    });
};

module.exports = { awsSignUp, awsSignIn, awsRefreshTokenExchange };
