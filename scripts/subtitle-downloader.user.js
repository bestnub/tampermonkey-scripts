// ==UserScript==
// @name         Subtitle Downloader
// @namespace    https://github.com/bestnub/tampermonkey-scripts
// @version      0.1
// @description  Downloads subs
// @author       BestNub
// @downloadURL  https://github.com/bestnub/tampermonkey-scripts/raw/main/scripts/subtitle-downloader.user.js
// @updateURL    https://github.com/bestnub/tampermonkey-scripts/raw/main/scripts/subtitle-downloader.user.js
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict'

  // Intercept XMLHttpRequest open method
  var originalOpen = XMLHttpRequest.prototype.open

  XMLHttpRequest.prototype.open = function (method, url) {

    try {
      if (url && url.startsWith("http")) {
        let urlO = new URL(url)
        if (urlO.pathname.endsWith(".vtt") && urlO.pathname.startsWith("/subtitle/")) {
          console.log(urlO)
          const reg = /\/subtitle\/[a-f0-9]+\/(eng|ger)-\d+\.vtt/
          if (urlO.pathname.match(reg)) {
            window.open(urlO.toString(), "_blank")
          }
        }
      }
    } catch (error) {
      console.log(error);
    }


    // Call the original open method
    originalOpen.apply(this, arguments)
  }

})();
