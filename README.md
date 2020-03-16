# VioDown

Download youtube videos using library <a href="https://github.com/fent/node-ytdl-core">ytdl-core</a>. This library is great with lots of examples, and it just works. Mine has very limited functionlities, so do have a look at this library and make one for yourself.

This program always downloads the media of highest quality. The video and audio are downloaded seperately. The general logic is that it starts with downloading the video part, and then the audio part, and then merge them into a media file of **mp4** format using ffmpeg. The video part and audio part downloaded previously are deleted once they are merged.

### Prerequisite

- NodeJS
- FFMPEG

## Video or Audio Quality

By default, this program chooses the highest quality option for both audio and video, however, this may be tremendously slower as Youtube limits the download speed for unknown reason. You can change the quality of audio and video based on your preference. For example, the code below chooses the highest audio quality. More available configuration on the "quality" property, see <a href="https://github.com/fent/node-ytdl-core">ytdl-core</a>.

    function downloadAudio(url, filePath) {
        ytdl(url, {
            quality: "highestaudio"
        })
        ....
    }

## How to use it?

Run the js file as follows:

    node script.js

Then provide the url and the path to where you want it to be downloaded based on the given instructions, make sure you also include the file name in the path.

    e.g., it should have absolute path as well as file name, but you do not need
    file extension, since it will always be of mp4 format

    /home/media/abc
