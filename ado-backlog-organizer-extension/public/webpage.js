/* eslint-disable no-undef */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Do something with the message!
  console.log(request);

  const url = new URL(window.location.href);
  const params = {
    protocol: url.protocol,
    host: url.host,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
  };
  console.log(params);

  // Currently two formats:
  // https://dev.azure.com/msazure/One/_workitems/assignedtome/
  // https://msazure.visualstudio.com/One/_workitems/assignedtome/

  let organization = null;
  let project = null;
  let areaPath = null;

  if (url.host.includes("dev.azure.com")) {
    const pathParts = url.pathname.split("/");
    organization = pathParts[1];
    project = pathParts[2];
  } else if (url.host.includes("visualstudio.com")) {
    const domainParts = url.host.split(".");
    const pathParts = url.pathname.split("/");
    organization = domainParts[0];
    project = pathParts[1];
  }

  console.log("Parsed", {
    organization,
    project,
    areaPath,
  });

  sendResponse({
    organization,
    project,
    areaPath,
  });
});
