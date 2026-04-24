const express = require('express');
const { getProviders, getProviderById } = require('../controllers/providerController');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.get('/', getProviders);
router.get('/:providerId', authorize, getProviderById);

module.exports = router;