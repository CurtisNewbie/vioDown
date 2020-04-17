const readline = require("readline");
const path = require("path");
const fileSys = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const AUDIO_INFIX = "_audio";
const VIDEO_INFIX = "_video";

let start_time;
let end_time;
let url;
let filePath;

let audioProgress = {
  name: "Audio Progress:",
  percentage: "0.00",
  remaining: "",
  chunkLength: "",
};
let videoProgress = {
  name: "Video Progress:",
  percentage: "0.00",
  remaining: "",
  chunkLength: "",
};

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
function download() {
  setStartTime();
  if (url) {
    if (!filePath) {
      filePath =
        "video-downloaded-at-" + new Date().toTimeString().substring(0, 8);
      console.log(
        `Filepath is not specified, it has been changed to \"${filePath}\"`
      );
    }
    Promise.all([downloadVideo(url, filePath), downloadAudio(url, filePath)])
      .then((values) => mergeVideoAndAudio(values[0], values[1]))
      .catch(console.log);
  } else {
    if (!url) console.log("URL cannot be empty");
  }
}

/**
 * Download video part asynchronously
 */
function downloadVideo() {
  return new Promise((resolve) => {
    let videoPath = filePath + VIDEO_INFIX;
    ytdl(url, {
      quality: "highestvideo",
      filter: "videoonly",
    })
      .on("error", console.error)
      .on("progress", updateVideoProgress)
      .pipe(fileSys.createWriteStream(videoPath))
      .on("finish", () => {
        resolve(videoPath);
      });
  });
}

/**
 *  Download audio part asynchronously
 */
function downloadAudio() {
  return new Promise((resolve) => {
    let audioPath = filePath + AUDIO_INFIX;
    ytdl(url, {
      quality: "highestaudio",
      filter: "audioonly",
    })
      .on("error", console.error)
      .on("progress", updateAudioProgress)
      .pipe(fileSys.createWriteStream(audioPath))
      .on("finish", () => {
        resolve(audioPath);
      });
  });
}

/**
 * Merge the video part and audio part using ffmpeg, once finished, it calls deleteTempFiles() to handle
 * temporary files.
 */
function mergeVideoAndAudio(videoPath, audioPath) {
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
      setEndTime();
      displayTimeTook();
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
 * Record start_time
 */
function setStartTime() {
  start_time = new Date().getTime();
}

/**
 * Record end_time
 */
function setEndTime() {
  end_time = new Date().getTime();
}

/**
 * Display the time took
 */
function displayTimeTook() {
  let units = ["seconds", "minutes", "hours"];
  let timeTook = (end_time - start_time) / 1000;
  let unit = units[0];
  for (let i = 1; i < units.length; i++) {
    if (timeTook < 60) break;

    timeTook /= 60;
    unit = units[i];
  }
  console.log("Took:", timeTook.toFixed(2), unit);
}

/**
-----------------------------------------------

This program always downloads the media file of the highest quality. The video and audio are 
downloaded asynchronously using Promise. The general logic is that it starts with downloading both 
the video part and the audio part asynchronously, and then merge them into a media file of 
mp4 format. The video part and audio part downloaded previously are deleted once they are merged.

-----------------------------------------------
*/
function main() {
  reader.question(
    ">>> Enter the video url that your want to download:\n",
    (str) => {
      url = str;
      reader.question(
        "\n>>> Enter the absolute or relative path (including file name) to the downloaded file:\n",
        (path) => {
          filePath = path;
          download();
          reader.close();
        }
      );
    }
  );
}
main();
