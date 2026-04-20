const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const axios = require('axios'); // Axios zaroori hai
const app = express();

app.use(cors());

app.get('/download', async (req, res) => {
    try {
        let videoURL = req.query.url;
        if (!videoURL) return res.status(400).send('URL missing!');

        videoURL = decodeURIComponent(videoURL).trim();

        // 1. Agar YouTube ka link hai
        if (ytdl.validateURL(videoURL)) {
            const options = {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
                    }
                }
            };
            const info = await ytdl.getInfo(videoURL, options);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' });
            
            res.header('Content-Disposition', 'attachment; filename="youtube_video.mp4"');
            return ytdl(videoURL, { format: format, ...options }).pipe(res);
        } 
        
        // 2. Agar TikTok ya koi aur direct video link hai
        else if (videoURL.includes('googlevideo.com') || videoURL.includes('tiktok.com') || videoURL.includes('ttsave')) {
            const response = await axios({
                method: 'get',
                url: videoURL,
                responseType: 'stream',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            res.header('Content-Disposition', 'attachment; filename="video.mp4"');
            return response.data.pipe(res);
        }

        else {
            res.status(400).send('YouTube Error: Not a supported domain yet.');
        }

    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('Error downloading: ' + err.message);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
