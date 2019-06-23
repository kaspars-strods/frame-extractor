import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CircularProgress from '@material-ui/core/CircularProgress';
import MovieRounded from '@material-ui/icons/MovieRounded';
import Typography from '@material-ui/core/Typography';

class VideoCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      audio: false
    };
  }

  render() {
    return (
      <div className='VideoCard'>
        <Card>
          <CardActionArea>
            <CardMedia>
              <MovieRounded />
            </CardMedia>
            <CardContent>
              <Typography variant='body2' color='textSecondary' component='p'>
                {this.props.videoName}
              </Typography>
            </CardContent>
          </CardActionArea>
          <CardActions>
            {this.props.mode === 'generate' && (
              <Button
                variant='contained'
                component='span'
                onClick={() => this.props.uploadVideo()}
              >
                Generate Frames
              </Button>
            )}
            {this.props.mode === 'download' && (
              <Button
                variant='contained'
                component='span'
                onClick={() => this.props.downloadFrames()}
              >
                Download Frames
              </Button>
            )}
            {this.props.mode === 'processing' && <CircularProgress />}
          </CardActions>
        </Card>
      </div>
    );
  }
}

export default VideoCard;
