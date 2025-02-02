(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(global, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*************************!*\
  !*** ./main/preload.ts ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);

const handler = {
  send(channel, value) {
    electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.send(channel, value);
  },
  on(channel, callback) {
    const subscription = (_event, ...args) => callback(...args);
    electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on(channel, subscription);
    return () => {
      electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.removeListener(channel, subscription);
    };
  }
};
electron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('ipc', handler);
electron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('electron', {
  // Window control methods
  minimize: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('minimize'),
  maximize: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('maximize'),
  close: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('close'),
  isMaximized: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('isMaximized'),
  // Deck management methods
  saveDeck: data => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('saveDeck', data),
  loadDeck: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('loadDeck'),
  // Dictionary methods
  fetchWordDefinition: word => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('dictionary:fetch-definition', word),
  fetchAudio: (word, region) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('dictionary:fetch-audio', word, region),
  // Audio cache methods
  checkAudioExists: key => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('audio:check-exists', key),
  getAudioPath: key => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('audio:get-path', key),
  saveAudioToCache: (key, buffer) => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('audio:save', key, buffer),
  clearOldAudioCache: maxAge => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('audio:clear-old', maxAge),
  // Anki export methods
  exportToAnki: data => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('deck:export-anki', data),
  // Update handlers
  checkForUpdates: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('update:check'),
  downloadUpdate: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('update:download'),
  installUpdate: () => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.invoke('update:install'),
  onUpdateChecking: callback => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('update:checking', callback),
  onUpdateAvailable: callback => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('update:available', (_event, info) => callback(info)),
  onUpdateNotAvailable: callback => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('update:not-available', (_event, info) => callback(info)),
  onUpdateError: callback => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('update:error', (_event, error) => callback(error)),
  onUpdateProgress: callback => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('update:progress', (_event, progress) => callback(progress)),
  onUpdateDownloaded: callback => electron__WEBPACK_IMPORTED_MODULE_0__.ipcRenderer.on('update:downloaded', (_event, info) => callback(info))
});
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTzs7Ozs7Ozs7OztBQ1ZBOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7OztBQ051RTtBQUd2RSxNQUFNRSxPQUFPLEdBQUc7RUFDZEMsSUFBSUEsQ0FBQ0MsT0FBZSxFQUFFQyxLQUFjLEVBQUU7SUFDcENKLGlEQUFXLENBQUNFLElBQUksQ0FBQ0MsT0FBTyxFQUFFQyxLQUFLLENBQUM7RUFDbEMsQ0FBQztFQUNEQyxFQUFFQSxDQUFDRixPQUFlLEVBQUVHLFFBQXNDLEVBQUU7SUFDMUQsTUFBTUMsWUFBWSxHQUFHQSxDQUFDQyxNQUF3QixFQUFFLEdBQUdDLElBQWUsS0FDaEVILFFBQVEsQ0FBQyxHQUFHRyxJQUFJLENBQUM7SUFDbkJULGlEQUFXLENBQUNLLEVBQUUsQ0FBQ0YsT0FBTyxFQUFFSSxZQUFZLENBQUM7SUFFckMsT0FBTyxNQUFNO01BQ1hQLGlEQUFXLENBQUNVLGNBQWMsQ0FBQ1AsT0FBTyxFQUFFSSxZQUFZLENBQUM7SUFDbkQsQ0FBQztFQUNIO0FBQ0YsQ0FBQztBQUVEUixtREFBYSxDQUFDWSxpQkFBaUIsQ0FBQyxLQUFLLEVBQUVWLE9BQU8sQ0FBQztBQUUvQ0YsbURBQWEsQ0FBQ1ksaUJBQWlCLENBQUMsVUFBVSxFQUFFO0VBQzFDO0VBQ0FDLFFBQVEsRUFBRUEsQ0FBQSxLQUFNWixpREFBVyxDQUFDYSxNQUFNLENBQUMsVUFBVSxDQUFDO0VBQzlDQyxRQUFRLEVBQUVBLENBQUEsS0FBTWQsaURBQVcsQ0FBQ2EsTUFBTSxDQUFDLFVBQVUsQ0FBQztFQUM5Q0UsS0FBSyxFQUFFQSxDQUFBLEtBQU1mLGlEQUFXLENBQUNhLE1BQU0sQ0FBQyxPQUFPLENBQUM7RUFDeENHLFdBQVcsRUFBRUEsQ0FBQSxLQUFNaEIsaURBQVcsQ0FBQ2EsTUFBTSxDQUFDLGFBQWEsQ0FBQztFQUVwRDtFQUNBSSxRQUFRLEVBQUdDLElBQW9DLElBQUtsQixpREFBVyxDQUFDYSxNQUFNLENBQUMsVUFBVSxFQUFFSyxJQUFJLENBQUM7RUFDeEZDLFFBQVEsRUFBRUEsQ0FBQSxLQUFNbkIsaURBQVcsQ0FBQ2EsTUFBTSxDQUFDLFVBQVUsQ0FBQztFQUU5QztFQUNBTyxtQkFBbUIsRUFBR0MsSUFBWSxJQUFLckIsaURBQVcsQ0FBQ2EsTUFBTSxDQUFDLDZCQUE2QixFQUFFUSxJQUFJLENBQUM7RUFDOUZDLFVBQVUsRUFBRUEsQ0FBQ0QsSUFBWSxFQUFFRSxNQUFtQixLQUFLdkIsaURBQVcsQ0FBQ2EsTUFBTSxDQUFDLHdCQUF3QixFQUFFUSxJQUFJLEVBQUVFLE1BQU0sQ0FBQztFQUU3RztFQUNBQyxnQkFBZ0IsRUFBR0MsR0FBVyxJQUFLekIsaURBQVcsQ0FBQ2EsTUFBTSxDQUFDLG9CQUFvQixFQUFFWSxHQUFHLENBQUM7RUFDaEZDLFlBQVksRUFBR0QsR0FBVyxJQUFLekIsaURBQVcsQ0FBQ2EsTUFBTSxDQUFDLGdCQUFnQixFQUFFWSxHQUFHLENBQUM7RUFDeEVFLGdCQUFnQixFQUFFQSxDQUFDRixHQUFXLEVBQUVHLE1BQWMsS0FBSzVCLGlEQUFXLENBQUNhLE1BQU0sQ0FBQyxZQUFZLEVBQUVZLEdBQUcsRUFBRUcsTUFBTSxDQUFDO0VBQ2hHQyxrQkFBa0IsRUFBR0MsTUFBYyxJQUFLOUIsaURBQVcsQ0FBQ2EsTUFBTSxDQUFDLGlCQUFpQixFQUFFaUIsTUFBTSxDQUFDO0VBRXJGO0VBQ0FDLFlBQVksRUFBR2IsSUFBNkMsSUFDMURsQixpREFBVyxDQUFDYSxNQUFNLENBQUMsa0JBQWtCLEVBQUVLLElBQUksQ0FBQztFQUU5QztFQUNBYyxlQUFlLEVBQUVBLENBQUEsS0FBTWhDLGlEQUFXLENBQUNhLE1BQU0sQ0FBQyxjQUFjLENBQUM7RUFDekRvQixjQUFjLEVBQUVBLENBQUEsS0FBTWpDLGlEQUFXLENBQUNhLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztFQUMzRHFCLGFBQWEsRUFBRUEsQ0FBQSxLQUFNbEMsaURBQVcsQ0FBQ2EsTUFBTSxDQUFDLGdCQUFnQixDQUFDO0VBQ3pEc0IsZ0JBQWdCLEVBQUc3QixRQUFvQixJQUNyQ04saURBQVcsQ0FBQ0ssRUFBRSxDQUFDLGlCQUFpQixFQUFFQyxRQUFRLENBQUM7RUFDN0M4QixpQkFBaUIsRUFBRzlCLFFBQTZCLElBQy9DTixpREFBVyxDQUFDSyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQ0csTUFBTSxFQUFFNkIsSUFBSSxLQUFLL0IsUUFBUSxDQUFDK0IsSUFBSSxDQUFDLENBQUM7RUFDdEVDLG9CQUFvQixFQUFHaEMsUUFBNkIsSUFDbEROLGlEQUFXLENBQUNLLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDRyxNQUFNLEVBQUU2QixJQUFJLEtBQUsvQixRQUFRLENBQUMrQixJQUFJLENBQUMsQ0FBQztFQUMxRUUsYUFBYSxFQUFHakMsUUFBZ0MsSUFDOUNOLGlEQUFXLENBQUNLLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQ0csTUFBTSxFQUFFZ0MsS0FBSyxLQUFLbEMsUUFBUSxDQUFDa0MsS0FBSyxDQUFDLENBQUM7RUFDcEVDLGdCQUFnQixFQUFHbkMsUUFBaUQsSUFDbEVOLGlEQUFXLENBQUNLLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDRyxNQUFNLEVBQUVrQyxRQUFRLEtBQUtwQyxRQUFRLENBQUNvQyxRQUFRLENBQUMsQ0FBQztFQUM3RUMsa0JBQWtCLEVBQUdyQyxRQUE2QixJQUNoRE4saURBQVcsQ0FBQ0ssRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQUNHLE1BQU0sRUFBRTZCLElBQUksS0FBSy9CLFFBQVEsQ0FBQytCLElBQUksQ0FBQztBQUN4RSxDQUFDLENBQUMsQyIsInNvdXJjZXMiOlsid2VicGFjazovL2Fua2liZWUvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL2Fua2liZWUvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcImVsZWN0cm9uXCIiLCJ3ZWJwYWNrOi8vYW5raWJlZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9hbmtpYmVlL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2Fua2liZWUvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Fua2liZWUvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9hbmtpYmVlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vYW5raWJlZS8uL21haW4vcHJlbG9hZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2Uge1xuXHRcdHZhciBhID0gZmFjdG9yeSgpO1xuXHRcdGZvcih2YXIgaSBpbiBhKSAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnID8gZXhwb3J0cyA6IHJvb3QpW2ldID0gYVtpXTtcblx0fVxufSkoZ2xvYmFsLCAoKSA9PiB7XG5yZXR1cm4gIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZWxlY3Ryb25cIik7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IGNvbnRleHRCcmlkZ2UsIGlwY1JlbmRlcmVyLCBJcGNSZW5kZXJlckV2ZW50IH0gZnJvbSAnZWxlY3Ryb24nXG5pbXBvcnQgeyBXb3JkQ2FyZCB9IGZyb20gJy4uL3JlbmRlcmVyL3R5cGVzL2RlY2snXG5cbmNvbnN0IGhhbmRsZXIgPSB7XG4gIHNlbmQoY2hhbm5lbDogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICAgIGlwY1JlbmRlcmVyLnNlbmQoY2hhbm5lbCwgdmFsdWUpXG4gIH0sXG4gIG9uKGNoYW5uZWw6IHN0cmluZywgY2FsbGJhY2s6ICguLi5hcmdzOiB1bmtub3duW10pID0+IHZvaWQpIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSAoX2V2ZW50OiBJcGNSZW5kZXJlckV2ZW50LCAuLi5hcmdzOiB1bmtub3duW10pID0+XG4gICAgICBjYWxsYmFjayguLi5hcmdzKVxuICAgIGlwY1JlbmRlcmVyLm9uKGNoYW5uZWwsIHN1YnNjcmlwdGlvbilcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpcGNSZW5kZXJlci5yZW1vdmVMaXN0ZW5lcihjaGFubmVsLCBzdWJzY3JpcHRpb24pXG4gICAgfVxuICB9LFxufVxuXG5jb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKCdpcGMnLCBoYW5kbGVyKVxuXG5jb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKCdlbGVjdHJvbicsIHtcbiAgLy8gV2luZG93IGNvbnRyb2wgbWV0aG9kc1xuICBtaW5pbWl6ZTogKCkgPT4gaXBjUmVuZGVyZXIuaW52b2tlKCdtaW5pbWl6ZScpLFxuICBtYXhpbWl6ZTogKCkgPT4gaXBjUmVuZGVyZXIuaW52b2tlKCdtYXhpbWl6ZScpLFxuICBjbG9zZTogKCkgPT4gaXBjUmVuZGVyZXIuaW52b2tlKCdjbG9zZScpLFxuICBpc01heGltaXplZDogKCkgPT4gaXBjUmVuZGVyZXIuaW52b2tlKCdpc01heGltaXplZCcpLFxuXG4gIC8vIERlY2sgbWFuYWdlbWVudCBtZXRob2RzXG4gIHNhdmVEZWNrOiAoZGF0YTogeyBjYXJkczogYW55W10sIG5hbWU6IHN0cmluZyB9KSA9PiBpcGNSZW5kZXJlci5pbnZva2UoJ3NhdmVEZWNrJywgZGF0YSksXG4gIGxvYWREZWNrOiAoKSA9PiBpcGNSZW5kZXJlci5pbnZva2UoJ2xvYWREZWNrJyksXG5cbiAgLy8gRGljdGlvbmFyeSBtZXRob2RzXG4gIGZldGNoV29yZERlZmluaXRpb246ICh3b3JkOiBzdHJpbmcpID0+IGlwY1JlbmRlcmVyLmludm9rZSgnZGljdGlvbmFyeTpmZXRjaC1kZWZpbml0aW9uJywgd29yZCksXG4gIGZldGNoQXVkaW86ICh3b3JkOiBzdHJpbmcsIHJlZ2lvbjogJ3VzJyB8ICdnYicpID0+IGlwY1JlbmRlcmVyLmludm9rZSgnZGljdGlvbmFyeTpmZXRjaC1hdWRpbycsIHdvcmQsIHJlZ2lvbiksXG5cbiAgLy8gQXVkaW8gY2FjaGUgbWV0aG9kc1xuICBjaGVja0F1ZGlvRXhpc3RzOiAoa2V5OiBzdHJpbmcpID0+IGlwY1JlbmRlcmVyLmludm9rZSgnYXVkaW86Y2hlY2stZXhpc3RzJywga2V5KSxcbiAgZ2V0QXVkaW9QYXRoOiAoa2V5OiBzdHJpbmcpID0+IGlwY1JlbmRlcmVyLmludm9rZSgnYXVkaW86Z2V0LXBhdGgnLCBrZXkpLFxuICBzYXZlQXVkaW9Ub0NhY2hlOiAoa2V5OiBzdHJpbmcsIGJ1ZmZlcjogQnVmZmVyKSA9PiBpcGNSZW5kZXJlci5pbnZva2UoJ2F1ZGlvOnNhdmUnLCBrZXksIGJ1ZmZlciksXG4gIGNsZWFyT2xkQXVkaW9DYWNoZTogKG1heEFnZTogbnVtYmVyKSA9PiBpcGNSZW5kZXJlci5pbnZva2UoJ2F1ZGlvOmNsZWFyLW9sZCcsIG1heEFnZSksXG5cbiAgLy8gQW5raSBleHBvcnQgbWV0aG9kc1xuICBleHBvcnRUb0Fua2k6IChkYXRhOiB7IGNhcmRzOiBXb3JkQ2FyZFtdOyBkZWNrTmFtZTogc3RyaW5nIH0pID0+IFxuICAgIGlwY1JlbmRlcmVyLmludm9rZSgnZGVjazpleHBvcnQtYW5raScsIGRhdGEpLFxuXG4gIC8vIFVwZGF0ZSBoYW5kbGVyc1xuICBjaGVja0ZvclVwZGF0ZXM6ICgpID0+IGlwY1JlbmRlcmVyLmludm9rZSgndXBkYXRlOmNoZWNrJyksXG4gIGRvd25sb2FkVXBkYXRlOiAoKSA9PiBpcGNSZW5kZXJlci5pbnZva2UoJ3VwZGF0ZTpkb3dubG9hZCcpLFxuICBpbnN0YWxsVXBkYXRlOiAoKSA9PiBpcGNSZW5kZXJlci5pbnZva2UoJ3VwZGF0ZTppbnN0YWxsJyksXG4gIG9uVXBkYXRlQ2hlY2tpbmc6IChjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gXG4gICAgaXBjUmVuZGVyZXIub24oJ3VwZGF0ZTpjaGVja2luZycsIGNhbGxiYWNrKSxcbiAgb25VcGRhdGVBdmFpbGFibGU6IChjYWxsYmFjazogKGluZm86IGFueSkgPT4gdm9pZCkgPT4gXG4gICAgaXBjUmVuZGVyZXIub24oJ3VwZGF0ZTphdmFpbGFibGUnLCAoX2V2ZW50LCBpbmZvKSA9PiBjYWxsYmFjayhpbmZvKSksXG4gIG9uVXBkYXRlTm90QXZhaWxhYmxlOiAoY2FsbGJhY2s6IChpbmZvOiBhbnkpID0+IHZvaWQpID0+IFxuICAgIGlwY1JlbmRlcmVyLm9uKCd1cGRhdGU6bm90LWF2YWlsYWJsZScsIChfZXZlbnQsIGluZm8pID0+IGNhbGxiYWNrKGluZm8pKSxcbiAgb25VcGRhdGVFcnJvcjogKGNhbGxiYWNrOiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkKSA9PiBcbiAgICBpcGNSZW5kZXJlci5vbigndXBkYXRlOmVycm9yJywgKF9ldmVudCwgZXJyb3IpID0+IGNhbGxiYWNrKGVycm9yKSksXG4gIG9uVXBkYXRlUHJvZ3Jlc3M6IChjYWxsYmFjazogKHByb2dyZXNzOiB7IHBlcmNlbnQ6IG51bWJlciB9KSA9PiB2b2lkKSA9PiBcbiAgICBpcGNSZW5kZXJlci5vbigndXBkYXRlOnByb2dyZXNzJywgKF9ldmVudCwgcHJvZ3Jlc3MpID0+IGNhbGxiYWNrKHByb2dyZXNzKSksXG4gIG9uVXBkYXRlRG93bmxvYWRlZDogKGNhbGxiYWNrOiAoaW5mbzogYW55KSA9PiB2b2lkKSA9PiBcbiAgICBpcGNSZW5kZXJlci5vbigndXBkYXRlOmRvd25sb2FkZWQnLCAoX2V2ZW50LCBpbmZvKSA9PiBjYWxsYmFjayhpbmZvKSksXG59KVxuXG5leHBvcnQgdHlwZSBJcGNIYW5kbGVyID0gdHlwZW9mIGhhbmRsZXJcbiJdLCJuYW1lcyI6WyJjb250ZXh0QnJpZGdlIiwiaXBjUmVuZGVyZXIiLCJoYW5kbGVyIiwic2VuZCIsImNoYW5uZWwiLCJ2YWx1ZSIsIm9uIiwiY2FsbGJhY2siLCJzdWJzY3JpcHRpb24iLCJfZXZlbnQiLCJhcmdzIiwicmVtb3ZlTGlzdGVuZXIiLCJleHBvc2VJbk1haW5Xb3JsZCIsIm1pbmltaXplIiwiaW52b2tlIiwibWF4aW1pemUiLCJjbG9zZSIsImlzTWF4aW1pemVkIiwic2F2ZURlY2siLCJkYXRhIiwibG9hZERlY2siLCJmZXRjaFdvcmREZWZpbml0aW9uIiwid29yZCIsImZldGNoQXVkaW8iLCJyZWdpb24iLCJjaGVja0F1ZGlvRXhpc3RzIiwia2V5IiwiZ2V0QXVkaW9QYXRoIiwic2F2ZUF1ZGlvVG9DYWNoZSIsImJ1ZmZlciIsImNsZWFyT2xkQXVkaW9DYWNoZSIsIm1heEFnZSIsImV4cG9ydFRvQW5raSIsImNoZWNrRm9yVXBkYXRlcyIsImRvd25sb2FkVXBkYXRlIiwiaW5zdGFsbFVwZGF0ZSIsIm9uVXBkYXRlQ2hlY2tpbmciLCJvblVwZGF0ZUF2YWlsYWJsZSIsImluZm8iLCJvblVwZGF0ZU5vdEF2YWlsYWJsZSIsIm9uVXBkYXRlRXJyb3IiLCJlcnJvciIsIm9uVXBkYXRlUHJvZ3Jlc3MiLCJwcm9ncmVzcyIsIm9uVXBkYXRlRG93bmxvYWRlZCJdLCJzb3VyY2VSb290IjoiIn0=