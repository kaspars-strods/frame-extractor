const archiver = require('archiver');
const cors = require('cors');
const express = require('express');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
const IncomingForm = require('formidable').IncomingForm;
const fs = require('fs');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.use(express.json());
app.use(express.static('./build'));

function createFolders(id) {
  fs.mkdirSync('./tmp/' + id, {
    recursive: true
  });
  fs.mkdirSync('./tmp/' + id + '/input', {
    recursive: true
  });
  fs.mkdirSync('./tmp/' + id + '/output', {
    recursive: true
  });
}

function getAudio(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .toFormat('mp3')
      .on('end', () => {
        console.log('conversion ended');
        resolve();
      })
      .on('error', err => {
        console.log('error: ', err);
      })
      .saveToFile(output + '/audio.mp3');
  });
}

function getFrames(input, output, frames) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .on('filenames', filenames => {
        console.log('Will generate ' + filenames.join(', '));
      })
      .on('end', () => {
        console.log('screenshots made');
        resolve();
      })
      .screenshots({
        count: frames,
        folder: output
      });
  });
}

function createZip(input, output, id) {
  return new Promise((resolve, reject) => {
    const outStream = fs.createWriteStream(
      output + '/' + id + '/frames-' + id + '.zip'
    );
    const archive = archiver('zip', {
      zlib: {
        level: 9
      }
    });

    outStream.on('close', () => {
      console.log(archive.pointer() + ' total bytes');
      console.log(
        'archiver has been finalized and the output file descriptor has closed.'
      );
      resolve();
    });

    outStream.on('end', () => {
      console.log('Data has been drained');
    });

    archive.on('error', err => {
      console.log(err);
    });

    archive.pipe(outStream);

    archive.directory(input, 'output');
    archive.finalize();
  });
}

app.post(
  '/process_video',
  async (req, res) => {
    let id = Math.random()
      .toString(36)
      .substring(7);

    await createFolders(id);

    let inputFolder = './tmp/' + id + '/input';
    let outputFolder = './tmp/' + id + '/output';

    var form = new IncomingForm();
    form.uploadDir = inputFolder;
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      let frames = getFrames(files.file.path, outputFolder, fields.frames);
      let jobs = [frames];
      if (fields.audio === 'true') {
        let audio = getAudio(files.file.path, outputFolder);
        jobs.push(audio);
      }

      Promise.all(jobs).then(() => {
        createZip(outputFolder, './tmp/', id).then(() => {
          res.send({ id: id });
        });
      });
    });
  },
  err => {
    console.log(err);
  }
);

app.get('/download/:id', (req, res) => {
  const file = './tmp/' + req.params.id + '/frames-' + req.params.id + '.zip';
  res.download(file);
});

module.exports = app;
