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

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   worker: () => (/* binding */ worker)\n/* harmony export */ });\n/* harmony import */ var msw_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! msw/browser */ \"../../../node_modules/.pnpm/msw@2.6.6_@types+node@22.10.1_typescript@5.9.2/node_modules/msw/lib/browser/index.js\");\n/* harmony import */ var msw_browser__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(msw_browser__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _handlers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handlers */ \"./mocks/handlers.ts\");\n/* harmony import */ var _src_worker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/src/worker */ \"../../../src/worker.ts\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_handlers__WEBPACK_IMPORTED_MODULE_0__, _src_worker__WEBPACK_IMPORTED_MODULE_1__]);\n([_handlers__WEBPACK_IMPORTED_MODULE_0__, _src_worker__WEBPACK_IMPORTED_MODULE_1__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\nconst worker = (0,msw_browser__WEBPACK_IMPORTED_MODULE_2__.setupWorker)(..._handlers__WEBPACK_IMPORTED_MODULE_0__.handlers.handlers);\n_src_worker__WEBPACK_IMPORTED_MODULE_1__.workerManager.setupWorker(worker);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9tb2Nrcy9icm93c2VyLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQTBDO0FBQ0o7QUFDTztBQUV0QyxNQUFNRyxTQUFTSCx3REFBV0EsSUFBSUMsK0NBQVFBLENBQUNBLFFBQVEsRUFBRTtBQUN4REMsc0RBQWFBLENBQUNGLFdBQVcsQ0FBQ0ciLCJzb3VyY2VzIjpbIi9Vc2Vycy9oeWVvbmpvbmcvRG9jdW1lbnRzL0dpdEh1Yi9tc3ctc2NlbmFyaW9zL3Rlc3RzL2UyZS90ZXN0LWFwcC9tb2Nrcy9icm93c2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNldHVwV29ya2VyIH0gZnJvbSAnbXN3L2Jyb3dzZXInO1xuaW1wb3J0IHsgaGFuZGxlcnMgfSBmcm9tICcuL2hhbmRsZXJzJztcbmltcG9ydCB7IHdvcmtlck1hbmFnZXIgfSBmcm9tICdAL3NyYy93b3JrZXInO1xuXG5leHBvcnQgY29uc3Qgd29ya2VyID0gc2V0dXBXb3JrZXIoLi4uaGFuZGxlcnMuaGFuZGxlcnMpO1xud29ya2VyTWFuYWdlci5zZXR1cFdvcmtlcih3b3JrZXIpO1xuIl0sIm5hbWVzIjpbInNldHVwV29ya2VyIiwiaGFuZGxlcnMiLCJ3b3JrZXJNYW5hZ2VyIiwid29ya2VyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./mocks/browser.ts\n");

/***/ })

};
;