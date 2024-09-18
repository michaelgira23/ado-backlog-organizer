/* eslint-disable no-undef */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  while (true) {
    try {
      const response = await chrome.runtime.sendMessage({
        organization: "organization",
        project: "project",
        areaPath: "path",
      });
      console.log(response);
    } catch (err) {
      // console.error(err);
    }

    await sleep(1000);
  }
})();
