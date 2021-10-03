import _helperPluginUtils from "https://cdn.skypack.dev/-/@babel/helper-plugin-utils@v7.14.5-BndCG7BrChRfEI6G53g6/dist=es2020,mode=imports/optimized/@babel/helper-plugin-utils.js";

function getDefaultExportFromCjs(x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function createCommonjsModule(fn, basedir, module) {
	return module = {
		path: basedir,
		exports: {},
		require: function(path, base) {
			return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
		}
	}, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
	throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var lib = createCommonjsModule(function(module, exports) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = void 0;
	var _default = (0, _helperPluginUtils.declare)((api) => {
		api.assertVersion(7);
		return {
			name: "syntax-import-assertions",
			manipulateOptions(opts, parserOpts) {
				parserOpts.plugins.push(["importAssertions"]);
			}
		};
	});
	exports.default = _default;
});
var index = /* @__PURE__ */ getDefaultExportFromCjs(lib);
export default index;
