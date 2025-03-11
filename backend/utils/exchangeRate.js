const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
require('dotenv').config();

const getExchangeRate = async (fromCurrency, toCurrency) => {
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cachedRate = cache.get(cacheKey);

    if (cachedRate) {
        return cachedRate;
    }

    try {
        const response = await axios.get(
            `https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/latest/${fromCurrency}`
        );
        const rates = response.data.conversion_rates;
        const exchangeRate = rates[toCurrency];

        // Cache the rate
        cache.set(cacheKey, exchangeRate);
        console.log("Fetched and cached new exchange rate");
        return exchangeRate;
    } catch (error) {
        throw new Error("Unable to fetch exchange rates");
    }
};

module.exports = { getExchangeRate };