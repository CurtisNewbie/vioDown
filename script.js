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

let audioProgress = {
  name: "Audio Progress:",
  percentage: "0%",
  remaining: "",
  chunkLength: "",
  downloaded: false
};
let videoProgress = {
  name: "Video Progress:",
  percentage: "0%",
  remaining: "",
  chunkLength: "",
  dowloaded: false
};
let isMerging = false;

/**
 * Callback function for updating audio progress
 */
function updateAudioProgress(chunkLength, downloaded, total) {
  let percentage = ((downloaded / total) * 100).toFixed(2);
  let remaining = ((total - downloaded) / 1000000).toFixed(2);
  audioProgress.percentage = percentage;
  audioProgress.remaining = remaining;
  audioProgress.chunkLength = chunkLength / 1000;
  displayProgress();
}

/**
 * Callback function for updating video progress
 */

function updateVideoProgress(chunkLength, downloaded, total) {
  let percentage = ((downloaded / total) * 100).toFixed(2);
  let remaining = ((total - downloaded) / 1000000).toFixed(2);
  videoProgress.percentage = percentage;
  videoProgress.remaining = remaining;
  videoProgress.chunkLength = chunkLength / 1000;
  displayProgress();
}

/**
 * Display audio and video progress
 */
function displayProgress() {
  display(
    audioProgress.name,
    audioProgress.percentage,
    audioProgress.remaining,
    audioProgress.chunkLength
  );
  display(
    videoProgress.name,
    videoProgress.percentage,
    videoProgress.remaining,
    videoProgress.chunkLength
  );
  console.log();
}

function display(name, percentage, remaining, chunkLength) {
  console.log(
    `${name} - ${percentage}%, Remaining: ${remaining}mb, ChunkLength: ${chunkLength}kb`
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
    downloadAudio(url, filePath);
  } else {
    if (!url) console.log("URL cannot be empty");
  }
}

/**
 * Download video part asynchronously
 */
function downloadVideo(url, filePath) {
  let videoPath = filePath + VIDEO_INFIX;
  ytdl(url, {
    quality: "highestvideo",
    filter: "videoonly"
  })
    .on("error", console.error)
    .on("progress", updateVideoProgress)
    .pipe(fileSys.createWriteStream(videoPath))
    .on("finish", () => {
      videoProgress.dowloaded = true;
      if (!isMerging) mergeVideoAndAudio(filePath);
    });
}

/**
 *  Download audio part asynchronously
 */
function downloadAudio(url, filePath) {
  let audioPath = filePath + AUDIO_INFIX;
  ytdl(url, {
    quality: "highestaudio",
    filter: "audioonly"
  })
    .on("error", console.error)
    .on("progress", updateAudioProgress)
    .pipe(fileSys.createWriteStream(audioPath))
    .on("finish", () => {
      audioProgress.downloaded = true;
      if (!isMerging) mergeVideoAndAudio(filePath);
    });
}

/**
 * Merge the video part and audio part using ffmpeg, once finished, it calls deleteTempFiles() to handle
 * temporary files.
 */
function mergeVideoAndAudio(filePath) {
  if (!audioProgress.downloaded || !videoProgress.dowloaded) return;

  isMerging = true;
  let videoPath = filePath + VIDEO_INFIX;
  let audioPath = filePath + AUDIO_INFIX;
  let audio = path.resolve(videoPath);
  let video = path.resolve(audioPath);

  if (!filePath.endsWith(".mp4")) filePath += ".mp4";
  console.log(
    `Merging ${videoPath} and ${audioPath} to ${filePath}, this may take a while`
  );

  ffmpeg()
    .input(video)
    .videoCodec("copy")
    .input(audio)
    .save(filePath)
    .on("error", console.error)
    .on("end", () => {
      console.log(
        `Done! Temporary audio and video files are successfully merged - ${filePath}`
      );
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

This program always downloads the media file of the highest quality. The video and audio are 
downloaded seperately in parallel. The general logic is that it starts with downloading both 
the video part and the audio part asynchronously, and then merge them into a media file of 
mp4 format. The video part and audio part downloaded previously are deleted once they are merged.

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
