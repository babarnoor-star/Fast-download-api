const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const axios = require('axios');
const app = express();

app.use(cors());

app.get('/download', async (req, res) => {
    try {
        let videoURL = req.query.url;
        if (!videoURL) return res.status(400).send('URL missing!');

        videoURL = decodeURIComponent(videoURL).trim();
        console.log("Request for:", videoURL);

        // CASE 1: Agar YouTube ka link hai
        if (ytdl.validateURL(videoURL) || videoURL.includes('youtube.com') || videoURL.includes('youtu.be')) {
            const options = {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
                    }
                }
            };
            const info = await ytdl.getInfo(videoURL, options);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' });
            
            res.header('Content-Disposition', `attachment; filename="youtube_video.mp4"`);
            return ytdl(videoURL, { format: format, ...options }).pipe(res);
        } 
        
        // CASE 2: TikTok, FB ya Google Playback links (Jo aapke frontend se aa rahe hain)
        else {
            const response = await axios({
                method: 'get',
                url: videoURL,
                responseType: 'stream',
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.tiktok.com/'
                }
            });
            res.header('Content-Disposition', 'attachment; filename="video.mp4"');
            return response.data.pipe(res);
        }

    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('Download Error: ' + err.message);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
