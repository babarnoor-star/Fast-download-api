const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const app = express();

app.use(cors());

app.get('/download', async (req, res) => {
    try {
        let videoURL = req.query.url;
        if (!videoURL) return res.status(400).send('URL missing!');

        // Link saaf karne ke liye
        videoURL = decodeURIComponent(videoURL).trim();
        console.log("Downloading for URL:", videoURL);

        const options = {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            }
        };

        const info = await ytdl.getInfo(videoURL, options);
        
        // Sab se behtareen quality (Audio+Video) dhoondna
        const format = ytdl.chooseFormat(info.formats, { 
            quality: 'highestvideo', 
            filter: 'audioandvideo' 
        });

        if (!format) return res.status(404).send('Format not found!');

        // Browser ko batana ke file download karni hai
        const title = info.videoDetails.title.replace(/[^\x00-\x7F]/g, "") || "video";
        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        
        ytdl(videoURL, { format: format, ...options }).pipe(res);

    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('YouTube Error: ' + err.message);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Backend is running on port ${PORT}`);
});
