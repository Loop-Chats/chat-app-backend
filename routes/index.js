var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/register', (req, res) => {
  res.send('register route');
});

module.exports = router;
