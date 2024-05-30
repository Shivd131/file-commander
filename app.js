const fs = require("fs/promises");
//using the promises api for fs module
//writing callback is more performant and preferred, however with promises, we avoid nested callbacks/ callback hell. we can handel our async opns more gracefully.

(async () => {
  const commandFileHandler = await fs.open("./command.txt", "r");

  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      //the file was changed.
      console.log("the file was changed", event);
      //next step, reading the content

      //getting the size of the file:
      const { size } = await commandFileHandler.stat();
      //console.log(size);
      const buff = Buffer.alloc(size);
      const offset = 0; //loc of buffer from which we start filling
      const length = buff.byteLength; //no of bytes to read
      const position = 0; // location of reading data
      const content = await commandFileHandler.read(
        buff,
        offset,
        length,
        position
      );
      console.log(content);
    }
  }
})();
