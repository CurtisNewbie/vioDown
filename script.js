const readline = require("readline");
const path = require("path");
const fileSys = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const AUDIO_INFIX = "_audio";
const VIDEO_INFIX = "_video";

/**
 * Callback function for displaying progress
 */
function displayProgress(chunkLength, downloaded, total) {
  console.log(
    `${((downloaded / total) * 100).toFixed(2)}% _ Remaining: ${(
      (total - downloaded) /
      1000000
    ).toFixed(2)}mb in chunk - ${chunkLength / 1000}kb`
  );
}

/**
 * Download media file on youtube
 * @param {*} url youtube url
 * @param {*} filePath absolute or relative path to where the media file should be downloaded, this path should end with a filename without file extension. The downloaded media file will always be of mp4 format
 */
function download(url, filePath) {
  if (url) {
    if (!filePath) {
      filePath =
        "video-downloaded-at-" + new Date().toTimeString().substring(0, 8);
      console.log(
        `Filepath is not specified, it has been changed to \"${filePath}\"`
      );
    }
    downloadVideo(url, filePath);
  } else {
    if (!url) console.log("URL cannot be empty");
  }
}

/**
 * Download video part, once it's finished, it calls downloadAudio() method
 */
function downloadVideo(url, filePath) {
  let videoPath = filePath + VIDEO_INFIX;
  console.log("Downloading Video to", videoPath);
  ytdl(url, {
    quality: "highestvideo",
    filter: "videoonly"
  })
    .on("error", console.error)
    .on("progress", displayProgress)
    .pipe(fileSys.createWriteStream(videoPath))
    .on("finish", () => {
      console.log(`Done! Video downloaded - '${videoPath}'`);
      downloadAudio(url, filePath);
    });
}

/**
 *  Download audio part, once it's finished, it calls mergeVideoAndAudio()
 */
function downloadAudio(url, filePath) {
  let audioPath = filePath + AUDIO_INFIX;
  console.log("Downloading Audio to", audioPath);
  ytdl(url, {
    quality: "highestaudio",
    filter: "audioonly"
  })
    .on("error", console.error)
    .on("progress", displayProgress)
    .pipe(fileSys.createWriteStream(audioPath))
    .on("finish", () => {
      mergeVideoAndAudio(filePath);
      console.log(`Done! Audio downloaded - '${audioPath}'`);
    });
}

/**
 * Merge the video part and audio part using ffmpeg, once finished, it calls deleteTempFiles() to handle
 * temporary files.
 */
function mergeVideoAndAudio(filePath) {
  let videoPath = filePath + VIDEO_INFIX;
  let audioPath = filePath + AUDIO_INFIX;
  let audio = path.resolve(videoPath);
  let video = path.resolve(audioPath);

  if (!filePath.endsWith(".mp4")) filePath += ".mp4";
  console.log(`Merging ${videoPath} and ${audioPath} to ${filePath}`);

  ffmpeg()
    .input(video)
    .videoCodec("copy")
    .input(audio)
    .save(filePath)
    .on("error", console.error)
    .on("end", () => {
      console.log(`Done! Merged File downloaded - ${filePath}`);
      deleteTempFiles(videoPath, audioPath);
    });
}

/**
 * Delete temporary files
 *
 * @param {*} pathToVideo path to the video part
 * @param {*} pathToAudio path to the audio part
 */
function deleteTempFiles(pathToVideo, pathToAudio) {
  console.log(`Deleting '${pathToVideo}' and '${pathToAudio}'`);
  fileSys.unlink(pathToVideo, () => {
    console.log(`${pathToVideo} deleted.`);
  });
  fileSys.unlink(pathToAudio, () => {
    console.log(`${pathToAudio} deleted.`);
  });
}

/**
-----------------------------------------------

This program always downloads the media file of the highest quality. The video and audio  are 
downloaded seperately. The general logic is that it starts with downloading video part, then 
the audio part, and then merge them into a media file of mp4 format. The video part and audio part
downloaded previously are deleted once they are merged.

-----------------------------------------------
*/
function main() {
  let url = "";
  let filePath = "";
  console.log();
  reader.question(
    ">>> Enter the video url that your want to download:\n",
    str => {
      url = str;
      reader.question(
        "\n>>> Enter the absolute or relative path (including file name) to the downloaded file:\n",
        path => {
          filePath = path;
          download(url, filePath);
          reader.close();
        }
      );
    }
  );
}
main();
