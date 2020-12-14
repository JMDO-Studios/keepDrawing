require('dotenv').config();
const router = require('express').Router();

const { AccessToken } = require('twilio').jwt;

const { ChatGrant } = AccessToken;

router.post('/token', (req, res) => {
  try {
    const { identity } = req.body;
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
    );
    token.identity = identity;
    const chatGrant = new ChatGrant({
      serviceSid: process.env.TWILIO_CHAT_SERVICE_SID,
    });
    token.addGrant(chatGrant);
    res.send({
      identity,
      token: token.toJwt(),
    });
  } catch (err) {
    console.error('Twilio chatroom could not load: ', err);
  }
});

module.exports = router;
