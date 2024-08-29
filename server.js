// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const axios = require('axios'); 

const app = express();
const port = 3333;

app.use(bodyParser.json());

const discordWebhookUrl = 'WEBHOOK_URL';
const commandsToExecute = "cd /home/ubuntu/getsoon/ && git pull origin main && npm install && npm run build && pm2 restart getsoon"
const sendErrorToDiscord = async (errorMessage) => {
  try {
    await axios.post(discordWebhookUrl, {
      content: `Error occurred: ${errorMessage}`,
    });
  } catch (error) {
    console.error('Failed to send error to Discord:', error);
  }
};

app.post('/webhook', (req, res) => {
  const event = req.headers['x-github-event'];
  console.log(`Received event: ${event}`);

  if (event === 'push') {
    exec(commandsToExecute, (error, stdout, stderr) => {
      if (error) {
        const errorMessage = `Error executing command: ${error.message}`;
        console.error(errorMessage);
        sendErrorToDiscord(errorMessage); 
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
  }

  res.status(200).send('Webhook received');
});

app.listen(port, () => {
  console.log(`Listening for GitHub webhooks on port ${port}`);
});
