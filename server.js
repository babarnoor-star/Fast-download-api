const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const app = express();

app.use(cors());

app.get('/download', async (req, res) => {
    try {
        let videoURL = req.query.url;

        if (!videoURL) {
            return res.status(400).send('URL missing!');
        }

        // 1. Link ko saaf karna (spaces aur extra encoding hatana)
        videoURL = decodeURIComponent(videoURL).trim();

        console.log("Processing URL:", videoURL); // Ye Render logs mein link dikhayega

        // 2. Check karna ke kya ye waqai YouTube ka link hai
        if (!ytdl.validateURL(videoURL)) {
            return res.status(400).send('Error: Not a valid YouTube domain or link');
        }

        const options = {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            }
        };

        const info = await ytdl.getInfo(videoURL, options);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' });

        res.header('Content-Disposition', `attachment; filename="video.mp4"`);
        ytdl(videoURL, { format: format, ...options }).pipe(res);

    } catch (err) {
        console.error('Detailed Error:', err.message);
        res.status(500).send('YouTube Error: ' + err.message);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server chalu hai port ${PORT} par`);
});
