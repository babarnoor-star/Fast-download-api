const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());

app.get('/download', async (req, res) => {
    try {
        let videoURL = req.query.url;
        if (!videoURL) return res.status(400).send('URL missing!');
        videoURL = decodeURIComponent(videoURL).trim();

        console.log("Downloading:", videoURL);

        // YouTube ke liye "Advanced Bypass" logic
        if (videoURL.includes('youtube.com') || videoURL.includes('youtu.be')) {
            // Hum aik aisi API use karenge jo YouTube ke blocks ko bypass karti hai
            const videoId = videoURL.split('v=')[1]?.split('&')[0] || videoURL.split('/').pop();
            const bypassApi = `https://invidious.sethforprivacy.com/api/v1/videos/${videoId}`;
            
            const apiRes = await axios.get(bypassApi);
            const formats = apiRes.data.formatStreams;
            // Sab se achi quality wala link uthao
            const bestLink = formats[formats.length - 1].url;

            const response = await axios({
                method: 'get',
                url: bestLink,
                responseType: 'stream'
            });

            res.header('Content-Disposition', `attachment; filename="youtube_video.mp4"`);
            return response.data.pipe(res);
        } 
        
        // TikTok / FB / Insta (Jo pehle se chal raha hai)
        else {
            const response = await axios({
                method: 'get',
                url: videoURL,
                responseType: 'stream',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            res.header('Content-Disposition', 'attachment; filename="video.mp4"');
            return response.data.pipe(res);
        }

    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('Download Failed. YouTube is being tough today!');
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
