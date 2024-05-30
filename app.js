const { create } = require("domain");
const fs = require("fs/promises");
//using the promises api for fs module
//writing callback is more performant and preferred, however with promises, we avoid nested callbacks/ callback hell. we can handel our async opns more gracefully.

(async () => {
  const createFile = async (path) => {
    try {
      //checking if we have the file already
      let existingFileHandle = await fs.open(path, "r");
      existingFileHandle.close();
      return console.log(`file ${path} already exists.`);

    } catch (error) {
      //if error, file is not present
      const newFileHandle = await fs.open(path, "w");
      console.log("File successfully created");
      newFileHandle.close();
    }

  };

  //commands
  const CREATE_FILE = "create a file";

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
    const command = buff.toString("utf-8");

    //create a file: create a file <path>
    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      createFile(filePath);
    }
  });
  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
