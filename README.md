# VioDown

Download youtube videos using library <a href="https://github.com/fent/node-ytdl-core">ytdl-core</a>. This library is great with lots of examples, and it just works. Mine has very limited functionlities, so do have a look at this library and make one for yourself.

### Prerequisite

- NodeJS

## Video or Audio Quality

Change the setting of quality based on your preferences. For example, the code below prefers the highest video quality over the audio quality. More available configuration, see <a href="https://github.com/fent/node-ytdl-core">ytdl-core</a>.

    ytdl(url, {
      // change to 'highestaudio' if necessary
      quality: "highestvideo"
    })

## How to use it?

Run the js file as follows:

    node script.js

Then provide the url and the path to where you want it to be downloaded based on the given instructions, make sure you also include the file name in the path.

    e.g., it should have absolute path as well as file name

    /home/media/abc.mp4
