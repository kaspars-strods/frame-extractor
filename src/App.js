import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import VideoCard from './VideoCard';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      audio: false,
      frames: 1,
      videoFile: null,
      videoName: null,
      id: null,
      mode: null
    };
  }

  changeFrames(e) {
    this.setState({ frames: e.target.value });
  }

  getFile() {
    const videoFile = document.getElementById('video-file').files[0];
    this.setState({
      videoFile: videoFile,
      videoName: videoFile.name,
      mode: 'generate'
    });
  }

  uploadVideo() {
    const data = new FormData();
    data.append('file', this.state.videoFile, this.state.videoName);
    data.append('frames', this.state.frames);
    data.append('audio', this.state.audio);

    axios
      .post('/process_video', data)
      .then(response => {
        this.setState({ id: response.data.id, mode: 'download' });
      })
      .catch(error => {
        console.log(error);
      });

    this.setState({ mode: 'processing' });
  }

  downloadFrames() {
    window.open('/download/' + this.state.id);
    this.setState({ mode: null });
  }

  render() {
    return (
      <div className='App'>
        <AppBar position='static' color='secondary'>
          <Toolbar>
            <Typography variant='h6' color='inherit'>
              Frame Extractor
            </Typography>
          </Toolbar>
        </AppBar>

        <div className='BodyWrapper'>
          <Paper className='Paper ParametersPaper'>
            <input
              accept='video/*'
              id='video-file'
              type='file'
              onChange={() => this.getFile()}
            />
            <label htmlFor='video-file'>
              <Button variant='contained' component='span'>
                Choose file
              </Button>
            </label>

            <TextField
              id='frames'
              label='Frames'
              onChange={e => this.changeFrames(e)}
              value={this.state.frames}
              type='number'
              InputLabelProps={{
                shrink: true
              }}
              margin='normal'
            />
            <FormGroup row>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.audio}
                    onChange={() => this.setState({ audio: !this.state.audio })}
                    value='audio'
                  />
                }
                label='Extract Audio'
              />
            </FormGroup>
          </Paper>
          {this.state.mode && (
            <VideoCard
              uploadVideo={this.uploadVideo.bind(this)}
              downloadFrames={this.downloadFrames.bind(this)}
              mode={this.state.mode}
              videoName={this.state.videoName}
            />
          )}
        </div>
      </div>
    );
  }
}

export default App;
