const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const app = express();

app.use(cors());

app.get('/download', async (req, res) => {
    const videoURL = req.query.url;

    if (!videoURL) {
        return res.status(400).send('URL ki zaroorat hai bhai!');
    }

    try {
        // YouTube ko dhoka dene ke liye headers
        const options = {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Connection': 'keep-alive'
                }
            }
        };

        const info = await ytdl.getInfo(videoURL, options);
        
        // Sab se achi quality select karna (Audio + Video)
        const format = ytdl.chooseFormat(info.formats, { 
            quality: 'highestvideo', 
            filter: 'audioandvideo' 
        });

        if (!format) {
            return res.status(404).send('Format nahi mila!');
        }

        // File download shuru karna
        res.header('Content-Disposition', 'attachment; filename="video.mp4"');
        ytdl(videoURL, { format: format, ...options }).pipe(res);

    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('YouTube ne block kiya ya koi masla hai: ' + err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server chalu hai port ${PORT} par`);
});
