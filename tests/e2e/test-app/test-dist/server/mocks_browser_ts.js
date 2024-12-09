"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "mocks_browser_ts";
exports.ids = ["mocks_browser_ts"];
exports.modules = {

/***/ "./mocks/browser.ts":
/*!**************************!*\
  !*** ./mocks/browser.ts ***!
  \**************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   worker: () => (/* binding */ worker)\n/* harmony export */ });\n/* harmony import */ var msw_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! msw/browser */ \"../../../node_modules/.pnpm/msw@2.6.6_@types+node@22.10.1_typescript@4.9.5/node_modules/msw/lib/browser/index.js\");\n/* harmony import */ var msw_browser__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(msw_browser__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _handlers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handlers */ \"./mocks/handlers.ts\");\n/* harmony import */ var _src_worker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/src/worker */ \"../../../src/worker.ts\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_handlers__WEBPACK_IMPORTED_MODULE_0__, _src_worker__WEBPACK_IMPORTED_MODULE_1__]);\n([_handlers__WEBPACK_IMPORTED_MODULE_0__, _src_worker__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\nconst worker = (0,msw_browser__WEBPACK_IMPORTED_MODULE_2__.setupWorker)(..._handlers__WEBPACK_IMPORTED_MODULE_0__.handlers.handlers);\n_src_worker__WEBPACK_IMPORTED_MODULE_1__.workerManager.setupWorker(worker);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9tb2Nrcy9icm93c2VyLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQTBDO0FBQ0o7QUFDTztBQUV0QyxNQUFNRyxTQUFTSCx3REFBV0EsSUFBSUMsK0NBQVFBLENBQUNBLFFBQVEsRUFBRTtBQUN4REMsc0RBQWFBLENBQUNGLFdBQVcsQ0FBQ0ciLCJzb3VyY2VzIjpbIi9Vc2Vycy9maW5kYS9Eb2N1bWVudHMvR2l0SHViL21zdy1zY2VuYXJpb3MvdGVzdHMvZTJlL3Rlc3QtYXBwL21vY2tzL2Jyb3dzZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc2V0dXBXb3JrZXIgfSBmcm9tICdtc3cvYnJvd3Nlcic7XG5pbXBvcnQgeyBoYW5kbGVycyB9IGZyb20gJy4vaGFuZGxlcnMnO1xuaW1wb3J0IHsgd29ya2VyTWFuYWdlciB9IGZyb20gJ0Avc3JjL3dvcmtlcic7XG5cbmV4cG9ydCBjb25zdCB3b3JrZXIgPSBzZXR1cFdvcmtlciguLi5oYW5kbGVycy5oYW5kbGVycyk7XG53b3JrZXJNYW5hZ2VyLnNldHVwV29ya2VyKHdvcmtlcik7XG4iXSwibmFtZXMiOlsic2V0dXBXb3JrZXIiLCJoYW5kbGVycyIsIndvcmtlck1hbmFnZXIiLCJ3b3JrZXIiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./mocks/browser.ts\n");

/***/ })

};
;