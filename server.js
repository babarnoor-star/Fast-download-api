const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());

app.get('/download', async (req, res) => {
    try {
        let videoURL = req.query.url;
        if (!videoURL) return res.status(400).send('URL missing!');
        videoURL = decodeURIComponent(videoURL).trim();

        console.log("Cobalt request for:", videoURL);

        // Cobalt API ko request bhej rahe hain
        const cobaltRes = await axios.post('https://api.cobalt.tools/api/json', {
            url: videoURL,
            vQuality: "720",
            filenamePattern: "basic"
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (cobaltRes.data.status === 'stream' || cobaltRes.data.status === 'redirect') {
            const directLink = cobaltRes.data.url;

            // Direct file stream karna
            const videoStream = await axios({
                method: 'get',
                url: directLink,
                responseType: 'stream'
            });

            res.header('Content-Disposition', `attachment; filename="video_download.mp4"`);
            return videoStream.data.pipe(res);
        } else {
            return res.status(500).send('Cobalt could not find a streamable link.');
        }

    } catch (err) {
        console.error('Cobalt Error:', err.message);
        res.status(500).send('Download Failed: YouTube/Platform protection is too high.');
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
