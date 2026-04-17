const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    const fileName = req.query.filename || 'video.mp4';

    if (!videoUrl) return res.status(400).send('URL is required');

    try {
        const response = await axios({
            method: 'get',
            url: videoUrl,
            responseType: 'stream'
        });

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'video/mp4');
        
        response.data.pipe(res);
    } catch (error) {
        res.status(500).send('Download failed: ' + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
