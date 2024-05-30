const fs = require("fs/promises");
//using the promises api for fs module
//writing callback is more performant and preferred, however with promises, we avoid nested callbacks/ callback hell. we can handel our async opns more gracefully.

(async () => {
  const commandFileHandler = await fs.open("./command.txt", "r");

  //as the next step, as all the FileHandle objects are <EventEmitter>s. using the emit property, we trigger it from line 34
  commandFileHandler.on("change", async () => {
    //the file was changed.
    console.log("the file was changed");
    //next step, reading the content

    //getting the size of the file:
    const { size } = await commandFileHandler.stat();
    //console.log(size);
    //allocating buffer with the size of our file.
    const buff = Buffer.alloc(size);
    //params for .read()
    const offset = 0; //loc of buffer from which we start filling
    const length = buff.byteLength; //no of bytes to read
    const position = 0; // location of reading data
    await commandFileHandler.read(buff, offset, length, position);
    console.log("Shiv", buff.toString("utf-8"));
  });
  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
