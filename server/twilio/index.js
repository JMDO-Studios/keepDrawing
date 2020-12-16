const router = require('express').Router();

router.use('/audio', require('./audio'));
router.use('/chat', require('./chat'));

module.exports = router;
