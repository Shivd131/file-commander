const { create } = require("domain");
const fs = require("fs/promises");
const path = require("path");
//using the promises api for fs module
//writing callback is more performant and preferred, however with promises, we avoid nested callbacks/ callback hell. we can handle our async opns more gracefully.

(async () => {
  //commands
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

  //function definitions
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
  const deleteFile = async (path) => {
    try {
      //checking if we have the file or not
      await fs.unlink(path);
      return console.log(`file deleted`);
    } catch (error) {
      if (error.code === "ENOENT") return console.log("file does not exist");
      else console.log("And error occured while deleting the file", error);
    }
  };
  const renameFile = async (oldPath, newPath) => {
    try {
      let existingFileHandle = await fs.open(oldPath, "r");
      await fs.rename(oldPath, newPath);
      existingFileHandle.close();
      return console.log("rename successful");
    } catch (error) {
      return console.log("file not found!");
    }
  };
  const addToFile = async (path, content) => {
    console.log("adding content to file");
    try {
      let existingFileHandle = await fs.open(path, "a");
      await fs.writeFile(path, content);
      existingFileHandle.close();
      return console.log("added content to the file");
    } catch (error) {
      return console.log("file does not exist", error);
    }
  };
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

    //delete a file: delete a file <path>
    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }

    //renaming file: rename the file <oldPath> to <newPath>
    if (command.includes(RENAME_FILE)) {
      const to_index = command.indexOf(" to ");
      const oldPath = command.substring(RENAME_FILE.length + 1, to_index);
      const newPath = command.substring(to_index + 4);
      renameFile(oldPath, newPath);
    }

    //add to file: add to the file <path> this content: <content>
    if (command.includes(ADD_TO_FILE)) {
      const index = command.indexOf(" this content: ");
      const filePath = command.substring(ADD_TO_FILE.length + 1, index);
      console.log(filePath);
      const content = command.substring(index + 15);
      console.log(content);
      addToFile(filePath, content);
    }
  });
  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
