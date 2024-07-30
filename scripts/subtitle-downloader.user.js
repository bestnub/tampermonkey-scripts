// ==UserScript==
// @name         Subtitle Downloader
// @namespace    https://github.com/bestnub/tampermonkey-scripts
// @version      0.2
// @description  Downloads subs
// @author       BestNub
// @downloadURL  https://github.com/bestnub/tampermonkey-scripts/raw/main/scripts/subtitle-downloader.user.js
// @updateURL    https://github.com/bestnub/tampermonkey-scripts/raw/main/scripts/subtitle-downloader.user.js
// @match        *://megacloud.tv/*
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function () {
  'use strict'

  // Function to download the file
  function downloadFile(url, filename) {
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      responseType: 'blob',
      onload: function (response) {
        const blob = new Blob([response.response], { type: 'text/vtt' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      onerror: function (error) {
        console.error('Download failed', error);
      }
    });
  }

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
            downloadFile(urlO.toString(), "subtitle.vtt")
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
