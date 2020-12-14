const router = require('express').Router();

router.use('/video', require('./video'));
router.use('/chat', require('./chat'));

module.exports = router;
