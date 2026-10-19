const router = require('express').Router();
const { requireApiKey } = require('../middleware/apiKey');
const { ingestLog, ingestBulk, queryLogs, logStats } = require('../controllers/logController');

router.get('/', queryLogs);
router.get('/stats', logStats);
router.post('/', requireApiKey, ingestLog);
router.post('/bulk', requireApiKey, ingestBulk);

module.exports = router;
