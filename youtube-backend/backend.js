const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/youtube', { useNewUrlParser: true, useUnifiedTopology: true });

const VideoSchema = new mongoose.Schema({
  videoId: String,
  url: String,
});

const Video = mongoose.model('Video', VideoSchema);

app.post('/api/getVideoUrl', async (req, res) => {
  const { videoId } = req.body;

  try {
    let video = await Video.findOne({ videoId });

    if (!video) {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=player&id=${videoId}&key=AIzaSyAwOMaYDXcw71CMKa9KPx06xdq7cL8GAmU`
      );

      const url = response.data.items[0].player.embedHtml.match(/src="(.*?)"/)[1];

      video = new Video({
        videoId,
        url,
      });

      await video.save();
    }

    res.json({ url: video.url });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});