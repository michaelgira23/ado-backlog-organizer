// Set the redirect URI to the chromiumapp.com provided by Chromium
const redirectUri =
  typeof chrome !== "undefined" && chrome.identity
    ? chrome.identity.getRedirectURL()
    : `${window.location.origin}/index.html`;

console.log("Chrome extension redirect URI set to ", redirectUri);
console.log(
  "This url must be registered in the Azure portal as a single-page application redirect uri, and as the post logout url"
);

const msalInstance = new msal.PublicClientApplication({
  auth: {
    authority: "https://login.microsoftonline.com/common/",
    clientId: "24dcfe4a-11ef-49e1-b141-571382e6c6bc",
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: "localStorage",
  },
});

// Set currently logged in account
const accounts = msalInstance.getAllAccounts();
if (accounts.length) {
  document.getElementById("username").textContent = accounts[0].username;
}

/**
 * Adds a sign in button for the user signed into the browser
 */
getSignedInUser().then(async (user) => {
  if (user) {
    const signInHintButton = document.getElementById("sign-in-hint");
    signInHintButton.textContent = `Sign In (w/ ${user.email})`;
    signInHintButton.addEventListener("click", async () => {
      const url = await getLoginUrl({
        loginHint: user.email,
      });

      const result = await launchWebAuthFlow(url);

      document.getElementById("username").textContent = result.account.username;
    });
    signInHintButton.classList.remove("hidden");
  }
});

/**
 * Sign in button
 */
document.getElementById("sign-in").addEventListener("click", async () => {
  const url = await getLoginUrl();

  const result = await launchWebAuthFlow(url);

  document.getElementById("username").textContent = result.account.username;
});

/**
 * Sign out button
 */
document.getElementById("sign-out").addEventListener("click", async () => {
  document.getElementById("username").textContent = "";
  document.getElementById("displayname").textContent = "";

  const logoutUrl = await getLogoutUrl();

  await launchWebAuthFlow(logoutUrl);
});

/**
 * Call graph button
 */
document.getElementById("call-graph").addEventListener("click", async () => {
  const graphResult = await callGraphMeEndpoint();

  document.getElementById("displayname").textContent = graphResult;
});

/**
 * Generates a login url
 */
async function getLoginUrl(request, reject) {
  return new Promise((resolve) => {
    msalInstance
      .loginRedirect({
        ...request,
        onRedirectNavigate: (url) => {
          resolve(url);
          return false;
        },
      })
      .catch(reject);
  });
}

/**
 * Generates a logout url
 */
async function getLogoutUrl(request) {
  return new Promise((resolve, reject) => {
    msalInstance
      .logout({
        ...request,
        onRedirectNavigate: (url) => {
          resolve(url);
          return false;
        },
      })
      .catch(reject);
  });
}

/**
 * Makes an http request to the MS graph Me endpoint
 */
async function callGraphMeEndpoint() {
  const { accessToken } = await acquireToken({
    scopes: [
      // "user_impersonation",
      // "vso.work",
      // "vso.work_write",
      // "499b84ac-1321-427f-aa17-267ca6975798/vso.work_write",
      //   "user.read",
      //   "'499b84ac-1321-427f-aa17-267ca6975798/user_impersonation'",
    ], // 499b84ac-1321-427f-aa17-267ca6975798/.default
    account: msalInstance.getAllAccounts()[0],
  });

  //   return callMSGraph("https://graph.microsoft.com/v1.0/me", accessToken);
  return callAdo(
    "https://dev.azure.com/hackathonADO2024/ADoManagement/_apis/wit/wiql?api-version=7.0",
    accessToken,
    "SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.State] <> 'Closed' ORDER BY [System.CreatedDate] DESC"
  );
}

/**
 * Makes an http request to the given MS graph endpoint
 */
async function callMSGraph(endpoint, accessToken) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers,
  };

  return fetch(endpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

// curl -u :PAT_TOKEN \
// -X POST \
// -H "Content-Type: application/json" \
// -d "{"query":"SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.WorkItemType] = 'Feature'"}" \
// https://dev.azure.com/hackathonADO2024/ADoManagement/_apis/wit/wiql?api-version=7.0

// https://learn.microsoft.com/en-us/rest/api/azure/devops/wit/wiql/query-by-wiql?view=azure-devops-rest-7.1&tabs=HTTP

/**
 * Makes an http request to Azure DevOps REST API endpoint
 */
async function callAdo(endpoint, accessToken, query) {
  const headers = new Headers();
  //   const authorization = `Bearer ${accessToken}`;
  const authorization = "Basic " + btoa("" + ":" + accessToken);

  headers.append("Authorization", authorization);
  headers.append("Content-Type", "application/json");

  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  };

  return fetch(endpoint, options)
    .then((response) => response.text())
    .catch((error) => console.log(error));
}

/**
 * Attempts to silent acquire an access token, falling back to interactive.
 */
async function acquireToken(request) {
  return msalInstance.acquireTokenSilent(request).catch(async (error) => {
    console.error(error);
    const acquireTokenUrl = await getAcquireTokenUrl(request);

    return launchWebAuthFlow(acquireTokenUrl);
  });
}

/**
 * Generates an acquire token url
 */
async function getAcquireTokenUrl(request) {
  return new Promise((resolve, reject) => {
    msalInstance
      .acquireTokenRedirect({
        ...request,
        onRedirectNavigate: (url) => {
          resolve(url);
          return false;
        },
      })
      .catch(reject);
  });
}

/**
 * Launch the Chromium web auth UI.
 * @param {*} url AAD url to navigate to.
 * @param {*} interactive Whether or not the flow is interactive
 */
async function launchWebAuthFlow(url) {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        interactive: true,
        url,
      },
      (responseUrl) => {
        // Response urls includes a hash (login, acquire token calls)
        if (responseUrl.includes("#")) {
          msalInstance
            .handleRedirectPromise(`#${responseUrl.split("#")[1]}`)
            .then(resolve)
            .catch(reject);
        } else {
          // Logout calls
          resolve();
        }
      }
    );
  });
}

/**
 * Returns the user sign into the browser.
 */
async function getSignedInUser() {
  return new Promise((resolve, reject) => {
    if (chrome && chrome.identity) {
      // Running in extension popup
      chrome.identity.getProfileUserInfo((user) => {
        if (user) {
          resolve(user);
        } else {
          resolve(null);
        }
      });
    } else {
      // Running on localhost
      resolve(null);
    }
  });
}
