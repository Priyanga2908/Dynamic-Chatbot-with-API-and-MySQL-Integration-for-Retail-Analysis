
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Import MySQL
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection setup
const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3307
});

// Root route - Check if server is running
app.get('/', (req, res) => {
    res.send('MySQL Test Server is running');
});

// Schema and sample queries definition
const schema = `You have the following schema:
1. Products(ProductID, Name, Description, Price, Category)
2. Customers(CustomerID, Name, Email)
3. Sales(SaleID, SaleDate, Amount, ProductID, CustomerID)
4. CustomerQueries(QueryID, CustomerID, QueryText, QueryDate)

Generate only the SQL query for: `;

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Received message:', message);

        // Dynamically import fetch
        const { default: fetch } = await import('node-fetch');

        // OpenAI request to generate SQL query with schema
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { 
                        role: 'user', 
                        content: `${schema}${message}` 
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extracting the generated SQL query
        const aiGeneratedSQL = data.choices[0].message.content.trim();
        console.log('Generated SQL:', aiGeneratedSQL);

        // Execute the SQL query on the MySQL database
        const [queryResults] = await connection.query(aiGeneratedSQL);

        // Generate a human-like response based on the query results
        const resultSummary = await generateHumanLikeResponse(queryResults);

        // Responding back with the human-like response
        res.json({
            //message: 'Query executed successfully',
            //sql: aiGeneratedSQL,
            data: resultSummary
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error executing query', error: error.message });
    }
});

// Function to generate human-like response from query results
const generateHumanLikeResponse = async (queryResults) => {
    const { default: fetch } = await import('node-fetch');

    // Construct a prompt for generating human-like responses
    const prompt = `Here are the results:
${JSON.stringify(queryResults, null, 2)}
Please summarize the results in a clean, structured, and conversational format. 
Ensure the summary is easy to read.`;

    // OpenAI request to generate human-like response
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
};

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
