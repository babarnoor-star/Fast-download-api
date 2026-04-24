const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());

// --- YE SECTION ADD KIYA HAI CRON-JOB KE LIYE ---
app.get('/', (req, res) => {
    res.send('Server is live and kicking! Cron-job is working.');
});
// ----------------------------------------------

app.get('/download', async (req, res) => {
    try {
        let videoURL = req.query.url;
        if (!videoURL) return res.status(400).send('URL missing!');
        videoURL = decodeURIComponent(videoURL).trim();

        console.log("Downloading from:", videoURL);

        // Sirf Non-YouTube platforms ke liye
        const response = await axios({
            method: 'get',
            url: videoURL,
            responseType: 'stream',
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*'
            }
        });

        res.header('Content-Disposition', 'attachment; filename="video_fast_dl.mp4"');
        return response.data.pipe(res);

    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('Download Failed. Link may be expired or private.');
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
