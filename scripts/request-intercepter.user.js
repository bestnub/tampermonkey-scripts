// ==UserScript==
// @name         Request Intercepter
// @namespace    https://github.com/bestnub/tampermonkey-scripts
// @version      0.1
// @description  Log all network requests
// @author       BestNub
// @downloadURL  https://github.com/bestnub/tampermonkey-scripts/raw/main/scripts/request-intercepter.user.js
// @updateURL    https://github.com/bestnub/tampermonkey-scripts/raw/main/scripts/request-intercepter.user.js
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict'

  // Intercept XMLHttpRequest open method
  var originalOpen = XMLHttpRequest.prototype.open

  XMLHttpRequest.prototype.open = function (method, url) {
    console.log(`${method.toUpperCase()} request intercepted:`, url)

    // Call the original open method
    originalOpen.apply(this, arguments)
  }

})(); 
