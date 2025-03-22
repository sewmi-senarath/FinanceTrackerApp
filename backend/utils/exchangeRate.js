// const axios = require("axios");
// const axiosRetry = require("axios-retry").default;
// const NodeCache = require("node-cache");
// const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
// const { createLogger, format, transports } = require("winston");
// require('dotenv').config();

// // Configure Winston logger
// const logger = createLogger({
//     level: "info",
//     format: format.combine(
//         format.timestamp(),
//         format.json()
//     ),
//     transports: [
//         new transports.Console(),
//         new transports.File({ filename: "exchange-rate.log" }),
//     ],
// });

// // Configure axios-retry
// axiosRetry(axios, {
//     retries: 3, // Retry up to 3 times
//     retryDelay: (retryCount) => {
//         return retryCount * 1000; // Wait 1 second between retries
//     },
//     retryCondition: (error) => {
//         // Retry on network errors or 5xx status codes
//         return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
//     },
// });

// const getExchangeRate = async (fromCurrency, toCurrency) => {
//     const cacheKey = `${fromCurrency}_${toCurrency}`;
//     const cachedRate = cache.get(cacheKey);

//     if (cachedRate) {
//         logger.info("Using cached exchange rate");
//         return cachedRate;
//     }

//     try {
//         const response = await axios.get(
//             `https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/latest/${fromCurrency}`
//         );
//         const rates = response.data.conversion_rates;

//         if (!rates || !rates[toCurrency]) {
//             throw new Error(`Exchange rate not found for ${toCurrency}`);
//         }

//         const exchangeRate = rates[toCurrency];

//         // Cache the rate
//         cache.set(cacheKey, exchangeRate);
//         logger.info("Fetched and cached new exchange rate");
//         return exchangeRate;
//     } catch (error) {
//         logger.error("Unable to fetch exchange rates", error.message);

//         // Fallback to a default rate
//         if (fromCurrency === toCurrency) {
//             return 1.0;
//         }

//         //log the error and throw a user-friendly message
//         throw new Error("Unable to fetch exchange rates. Please try again later.");
//     }
// };

// module.exports = { getExchangeRate };

// utils/exchangeRate.js
const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const NodeCache = require("node-cache");
const { createLogger, format, transports } = require("winston");
require("dotenv").config();

// Initialize cache (1-hour TTL)
const cache = new NodeCache({ stdTTL: 3600 });

// Configure Winston logger
const logger = createLogger({
    level: "info",
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "exchange-rate.log" }),
    ],
});

// Configure axios-retry
axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000,
    retryCondition: (error) => {
        return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
    },
});

const getExchangeRate = async (fromCurrency, toCurrency) => {
    // Handle case where currencies are the same
    if (fromCurrency === toCurrency) {
        return 1.0;
    }

    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cachedRate = cache.get(cacheKey);

    if (cachedRate) {
        logger.info(`Using cached exchange rate for ${fromCurrency} to ${toCurrency}`);
        return cachedRate;
    }

    try {
        // Validate API key
        if (!process.env.API_KEY) {
            throw new Error("Exchange rate API key is missing in environment variables");
        }

        const response = await axios.get(
            `https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/latest/${fromCurrency}`
        );

        // Check for API error response
        if (response.data.result === "error") {
            throw new Error(`API Error: ${response.data["error-type"] || "Unknown error"}`);
        }

        const rates = response.data.conversion_rates;
        if (!rates || !rates[toCurrency]) {
            throw new Error(`Exchange rate not found for ${toCurrency} from ${fromCurrency}`);
        }

        const exchangeRate = rates[toCurrency];

        // Cache the rate
        cache.set(cacheKey, exchangeRate);
        logger.info(`Fetched and cached new exchange rate for ${fromCurrency} to ${toCurrency}: ${exchangeRate}`);
        return exchangeRate;
    } catch (error) {
        logger.error(`Failed to fetch exchange rate for ${fromCurrency} to ${toCurrency}: ${error.message}`);
        
        // Fallback to a default rate or throw a detailed error
        throw new Error(
            `Unable to fetch exchange rates for ${fromCurrency} to ${toCurrency}: ${error.message}. Please try again later.`
        );
    }
};

module.exports = { getExchangeRate };