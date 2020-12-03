require('dotenv').config();
const router = require('express').Router;

const { AccessToken } = require('twilio').jwt;

const { VideoGrant } = AccessToken;

router.post('/token', (req, res) => {
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
  );
  token.identity = req.body.identity;
  const grant = new VideoGrant();
  grant.room = req.body.room;
  token.addGrant(grant);
  res.send({
    token: token.toJwt(),
  });
});

module.exports = router;
