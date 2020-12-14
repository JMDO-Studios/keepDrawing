require('dotenv').config();
const router = require('express').Router();

const { AccessToken } = require('twilio').jwt;

const { VideoGrant } = AccessToken;

router.post('/token', (req, res) => {
  try {
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
    );
    token.identity = req.body.identity;
    const videoGrant = new VideoGrant();
    videoGrant.room = req.body.room;
    token.addGrant(videoGrant);
    res.send({
      token: token.toJwt(),
    });
  } catch (err) {
    console.error('Twilio audio chat could not load: ', err);
  }
});

module.exports = router;
