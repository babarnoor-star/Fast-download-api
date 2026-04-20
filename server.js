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

        console.log("Processing:", videoURL);

        if (ytdl.validateURL(videoURL)) {
            // Sabse advanced headers jo abhi kaam kar rahe hain
            const options = {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    }
                }
            };

            const info = await ytdl.getInfo(videoURL, options);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
            
            res.header('Content-Disposition', `attachment; filename="video.mp4"`);
            return ytdl(videoURL, { format: format, ...options }).pipe(res);
        } else {
            // TikTok/FB ke liye direct stream (Jo tumhara chal raha hai)
            const response = await axios({
                method: 'get',
                url: videoURL,
                responseType: 'stream'
            });
            return response.data.pipe(res);
        }
    } catch (err) {
        console.error('Error:', err.message);
        // Agar 403 aaye toh saaf message mil jaye
        res.status(500).send('YouTube Blocked this request (403). Need Cookies to bypass.');
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
