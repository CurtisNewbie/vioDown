const readline = require("readline");
const fileSys = require("fs");
const ytdl = require("ytdl-core");

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function displayProgress(chunkLength, downloaded, total) {
  console.log(
    `${((downloaded / total) * 100).toFixed(2)}% _ Remaining: ${(
      (total - downloaded) /
      1000000
    ).toFixed(2)}mb in chunk - ${chunkLength / 1000}kb`
  );
}

function download(url, filePath) {
  if (url) {
    if (!filePath)
      filePath =
        "video-downloaded-at-" + new Date().toTimeString().substring(0, 8);
    console.log(
      `Filepath is not specified, it has been changed to \"${filePath}\"`
    );

    console.log(`Downloading '${url}' to '${filePath}'`);
    ytdl(url, {
      // change to 'highestaudio' if necessary
      quality: "highestvideo"
    })
      .on("error", console.error)
      .on("progress", displayProgress)
      .pipe(fileSys.createWriteStream(filePath))
      .on("finish", () => {
        console.log(`Done! Video downloaded - '${filePath}'`);
      });
  } else {
    if (!url) console.log("URL cannot be empty");
  }
}

/*
-----------------------------------------------

Main

-----------------------------------------------
*/
let url = "";
let filePath = "";
console.log();
reader.question("Enter the video url that your want to download:\n", str => {
  url = str;
  reader.question(
    "Enter the absolute (or relative) path and name of this downloaded file:\n",
    path => {
      filePath = path;
      download(url, filePath);
      reader.close();
    }
  );
});
