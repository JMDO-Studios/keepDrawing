require('dotenv').config();
const router = require('express').Router;
const faker = require('faker');

const { AccessToken } = require('twilio').jwt;

const { VideoGrant } = AccessToken;

router.get('/', (req, res) => {
  const identity = faker.name.findName();
  // Create an Access Token
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
  );
  // Set the Identity of this token
  token.identity = identity;
  // Grant access to Video
  const grant = new VideoGrant();
  grant.room = 'cool room';
  token.addGrant(grant);
  res.send({
    identity,
    token: token.toJwt(),
  });
});
