const express = require('express');
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/download', async (req, res) => {
    const videoURL = req.query.url;

    if (!videoURL) {
        return res.status(400).send('URL is required');
    }

    try {
        // YouTube ko "Asli Browser" lagne ke liye headers
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
        
        // Sab se achi quality dhoondna
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' });

        if (!format) {
            return res.status(404).send('No suitable format found');
        }

        // Browser ko batana ke ye file download honi hai
        res.header('Content-Disposition', `attachment; filename="video.mp4"`);
        
        // Video stream shuru karna
        ytdl(videoURL, { format: format, ...options }).pipe(res);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing download: ' + err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
