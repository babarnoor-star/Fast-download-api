const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const axios = require('axios');
const app = express();

app.use(cors());

// YAHAN APNI COOKIES DAALNI HAIN (Step 2 dekhein)
const COOKIES = []; 

app.get('/download', async (req, res) => {
    try {
        let videoURL = req.query.url;
        if (!videoURL) return res.status(400).send('URL missing!');
        videoURL = decodeURIComponent(videoURL).trim();

        if (ytdl.validateURL(videoURL) || videoURL.includes('youtube.com') || videoURL.includes('youtu.be')) {
            const options = {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                        'cookie': COOKIES.join('; ') // Cookies yahan use hongi
                    }
                }
            };
            
            const info = await ytdl.getInfo(videoURL, options);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' });
            
            res.header('Content-Disposition', `attachment; filename="video.mp4"`);
            return ytdl(videoURL, { format: format, ...options }).pipe(res);
        } 
        else {
            // Non-YouTube platforms ke liye
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
        console.error('Final Error:', err.message);
        res.status(500).send('Download Failed: ' + err.message);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
