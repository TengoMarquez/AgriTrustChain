const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors({
    origin: '*',  // 允许所有来源
    methods: ['GET', 'POST'],  // 允许的HTTP方法
    allowedHeaders: ['Content-Type', 'Authorization']  // 允许的头部
}));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    console.log('Received request:', req.body);
    try {
        const response = await axios.post('https://spark-api-open.xf-yun.com/v1/chat/completions', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer a99fb4e52b7cc43be33b6ebf8232097f'
            }
        });
        console.log('API response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));