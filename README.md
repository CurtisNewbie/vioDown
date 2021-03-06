# VioDown

Download youtube videos using library <a href="https://github.com/fent/node-ytdl-core">ytdl-core</a>. This library is great with lots of examples, and it just works. Mine has very limited functionlities, so do have a look at this library and make one for yourself.

This program always chooses the highest quality option. The video and audio are downloaded seperately and in parallel. The general logic is that it starts with downloading both the video part and the audio part asynchronously, and then merge them into a media file of **mp4** format using **ffmpeg**. The video part and audio part downloaded previously are deleted once they are merged.

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

    e.g, in the console, it will be like this:

    >>> Enter the video url that your want to download:
    https://www.youtube.com/watch?v=RGOWPswqRwc

    >>> Enter the absolute or relative path (including file name) to the downloaded file:
    /home/yongjie/media/favourite-cocktail
    Audio Progress: - 0.00%, Remaining: mb, ChunkLength: kb
    Video Progress: - 0.00%, Remaining: 461.58mb, ChunkLength: 16.384kb

    Audio Progress: - 0.00%, Remaining: mb, ChunkLength: kb
    Video Progress: - 0.01%, Remaining: 461.56mb, ChunkLength: 16.384kb

    Audio Progress: - 0.11%, Remaining: 14.67mb, ChunkLength: 16.384kb
    Video Progress: - 0.01%, Remaining: 461.55mb, ChunkLength: 16.384kb

    ....

    Once finished, the downloaded media file path and name will be:
    /home/yongjie/media/favourite-cocktail.mp4
