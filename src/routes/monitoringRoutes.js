const router = require('express').Router();
const { health, metrics } = require('../controllers/monitoringController');

router.get('/health', health);
router.get('/metrics', metrics);

module.exports = router;
