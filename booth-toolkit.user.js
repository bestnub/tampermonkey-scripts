// ==UserScript==
// @name         Booth Toolkit
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  Enhance your Booth browsing experience with various features
// @author       BestNub
// @downloadURL  https://github.com/bestnub/tampermonkey-scripts/raw/main/booth-toolkit.user.js
// @updateURL    https://github.com/bestnub/tampermonkey-scripts/raw/main/booth-toolkit.user.js
// @match        https://booth.pm/*
// @match        https://*.booth.pm/*
// @connect      api.currencyapi.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // Currency vars
    const apiEndpoint = 'https://api.currencyapi.com/v3/latest';
    let apiKey = GM_getValue('apiKey', null);
    const baseCurrency = 'JPY';
    const targetCurrency = 'EUR';

    let exchangeRate = GM_getValue('exchangeRate', null);
    let lastUpdate = GM_getValue('lastUpdate', 0);
    let hasDom = false;

    // Define jpyPatterns for matching and replacing
    const jpyPatterns = [
        { from: /([\d,]+)\s*JPY/i, to: (matches) => `${convertYenToEuro(parseFloat(matches[1].replace(',', '')))} EUR` },
        { from: /([\d,]+)\s*¥/i, to: (matches) => `${convertYenToEuro(parseFloat(matches[1].replace(',', '')))}€` },
        // Add more jpyPatterns as needed
    ];

    // Currency api functions
    function convertYenToEuro(yenPrice) {
        const euroPrice = yenPrice * exchangeRate;
        return euroPrice.toFixed(2);
    }

    function updateRate() {
        checkApiKey();
        if (apiKey) {
            console.log("Update Rate")
            GM_xmlhttpRequest({
                method: 'GET',
                url: `${apiEndpoint}?base_currency=${baseCurrency}&currencies=${targetCurrency}`,
                headers: {
                    'apikey': apiKey,
                },
                onload: function (response) {
                    if (response.status === 200) {
                        exchangeRate = JSON.parse(response.responseText).data.EUR.value;
                        GM_setValue('exchangeRate', exchangeRate);
                        lastUpdate = new Date().getTime();
                        GM_setValue('lastUpdate', lastUpdate);
                    } else {
                        console.error('Failed to fetch exchange rate:', response.statusText);
                    }
                },
                onerror: function (error) {
                    console.error('Error fetching exchange rate:', error);
                },
            });
        }
    }

    function checkApiKey() {
        const apiKeyPattern = /^cur_live_[a-zA-Z0-9]{40}$/;

        if (!apiKey || !apiKeyPattern.test(apiKey)) {
            // Open CurrencyAPI website in a new tab to guide the user in obtaining an API key
            GM_openInTab('https://app.currencyapi.com/');

            // Prompt user for API key if not set or if the format is incorrect
            apiKey = prompt('Please enter your CurrencyAPI API key (format: cur_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX):');

            if (!apiKeyPattern.test(apiKey)) {
                alert('Invalid API key format. Please enter a valid API key. Reload to try again.');
                // checkApiKey(); // Prompt again if the format is still incorrect
                return;
            }

            GM_setValue('apiKey', apiKey);
        }
    }

    function isRateUpdated() {
        const nHourInMillis = 12 * 60 * 60 * 1000;
        const currentTime = new Date().getTime();
        return !(currentTime - lastUpdate > nHourInMillis);
    }


    function checkAndUpdateRate() {
        console.log("Check if rate update is needed")
        if (exchangeRate == null || !isRateUpdated()) {
            updateRate();
            if (isRateUpdated()) {
                replaceYenPrices();
            }
        } else {
            replaceYenPrices();
        }
    }


    // Function to apply jpyPatterns to text content
    function applyPatterns(textContent) {
        for (const pattern of jpyPatterns) {
            const matches = textContent.match(pattern.from);
            if (matches) {
                const replacement = pattern.to(matches);
                textContent = textContent.replace(pattern.from, replacement);
            }
        }
        return textContent;
    }

    // Function to check if an element contains the specified text
    function containsJPY(element) {
        if (element.querySelector('*')) {
            return false;
        }
        // Check if the text content contains the JPY pattern
        return jpyPatterns.some(pattern => pattern.from.test(element.textContent.trim()));
    }

    // Function to replace yen prices with euro prices
    function replaceYenPrices() {
        if (exchangeRate !== null && hasDom && isRateUpdated()) { // Ensures prices are correctly updated
            console.log("Replacing Prices")
            // Select all elements and filter those containing the JPY pattern
            var elementsWithJPY = Array.from(document.querySelectorAll('*')).filter(containsJPY);

            // Now you can work with the selected elements
            for (const element of elementsWithJPY) {
                element.textContent = applyPatterns(element.textContent);
                // element.style.outline = '2px dotted green';
                // Add more actions or styles as needed
            }
        }
    }

    // Function to redirect URLs
    function redirectUrls() {
        const currentUrl = window.location.href;

        // Define the patterns for redirection
        const redirectPatterns = [
            { from: /\/ja\//i, to: '/en/' },
            { from: /\/ko\//i, to: '/en/' },
            { from: /\/zh-cn\//i, to: '/en/' },
            { from: /\/zh-tw\//i, to: '/en/' },
            { from: /^https:\/\/[^\/]+\.booth\.pm\/items\//i, to: 'https://booth.pm/en/items/' }
        ];

        // Check if the current URL matches any of the patterns
        for (const pattern of redirectPatterns) {
            if (pattern.from.test(currentUrl)) {
                const newUrl = currentUrl.replace(pattern.from, pattern.to);
                window.location.href = newUrl;
                break;
            }
        }
    }

    // Function to be executed when the DOM is fully loaded
    function onLoad() {
        hasDom = true;
        replaceYenPrices();
    }
    // Function to be executed when the DOMContent is loaded
    function onDOMContentLoaded() {
        checkAndUpdateRate();
    }

    document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
    window.addEventListener('load', onLoad);

    // Run instantly
    redirectUrls();
})();
