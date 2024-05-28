const fs = require("fs/promises");
//using the promises api for fs module
//writing callback is more performant and preferred, however with promises, we avoid nested callbacks/ callback hell. we can handel our async opns more gracefully.

(async () => {
  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      //the file was changed.
      console.log("the file was changed", event);
    }
  }
})();
