/* eslint-disable no-undef */

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
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

  //   try {
  //     console.log("getting area path");
  //     areaPath = await getAreaPath();
  //   } catch (err) {
  //     console.error("Error getting area path", err);
  //   }

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

function getAreaPath() {
  return new Promise((resolve, reject) => {
    // Open the database
    let request = indexedDB.open("wit");

    request.onsuccess = function (event) {
      let db = event.target.result;

      // Create a transaction
      let transaction = db.transaction(["metaDataCache"], "readonly");

      // Get the object store
      let objectStore = transaction.objectStore("metaDataCache");

      // Use a cursor to iterate over all records
      let cursorRequest = objectStore.openCursor();

      cursorRequest.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
          console.log(
            "Key: " + cursor.key + ", Value: " + JSON.stringify(cursor.value)
          );
          cursor.continue();
        } else {
          console.log("No more entries!");
        }
        resolve();
      };

      cursorRequest.onerror = function (event) {
        console.error("Cursor request error: " + event.target.errorCode);
        reject(event);
      };
    };

    request.onerror = function (event) {
      console.error("Database error: " + event.target.errorCode);
      reject(event);
    };
  });
}
