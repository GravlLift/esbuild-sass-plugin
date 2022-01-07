"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sassPlugin = void 0;
const path_1 = require("path");
const utils_1 = require("./utils");
const cache_1 = require("./cache");
const render_1 = require("./render");
function sassPlugin(options = {}) {
    var _a;
    if (!options.basedir) {
        options.basedir = process.cwd();
    }
    if (options.includePaths) {
        console.log(`'includePaths' option is deprecated, please use 'loadPaths' instead`);
    }
    options.loadPaths = Array.from(new Set([
        ...options.loadPaths || (0, utils_1.modulesPaths)(),
        ...options.includePaths || []
    ]));
    const type = (_a = options.type) !== null && _a !== void 0 ? _a : 'css';
    if (options['picomatch'] || options['exclude'] || typeof type !== 'string') {
        console.log('The type array, exclude and picomatch options are no longer supported, please refer to the README for alternatives.');
    }
    const requireOptions = { paths: ['.', ...options.loadPaths] };
    function resolvePath(basedir, path) {
        if (options.importMapper) {
            path = options.importMapper(path);
        }
        if (utils_1.RELATIVE_PATH.test(path)) {
            return (0, path_1.resolve)(basedir, path);
        }
        else {
            requireOptions.paths[0] = basedir;
            return require.resolve(path, requireOptions);
        }
    }
    return {
        name: 'sass-plugin',
        setup({ initialOptions, onLoad, onResolve }) {
            var _a, _b;
            const { namespace, sourcemap, watched } = (0, utils_1.getContext)(initialOptions);
            onResolve({ filter: (_a = options.filter) !== null && _a !== void 0 ? _a : /\.(s[ac]ss|css)$/ }, (args) => {
                const { resolveDir, path, importer } = args;
                const basedir = resolveDir || (0, path_1.dirname)(importer);
                return { path: resolvePath(basedir, path), namespace, pluginData: args };
            });
            const renderSync = (0, render_1.createRenderer)(options, (_b = options.sourceMap) !== null && _b !== void 0 ? _b : sourcemap);
            const transform = options.transform;
            onLoad({ filter: /./, namespace }, (0, cache_1.useCache)(options, async (path) => {
                var _a;
                try {
                    let { css, watchFiles } = renderSync(path);
                    if (watched) {
                        watched[path] = watchFiles;
                    }
                    const resolveDir = (0, path_1.dirname)(path);
                    if (transform) {
                        const out = await transform(css, resolveDir, path);
                        if (typeof out !== 'string') {
                            return {
                                contents: out.contents,
                                loader: out.loader,
                                resolveDir,
                                watchFiles: [...watchFiles, ...(out.watchFiles || [])],
                                watchDirs: out.watchDirs || []
                            };
                        }
                        else {
                            css = out;
                        }
                    }
                    return type === 'css' ? {
                        contents: css,
                        loader: 'css',
                        resolveDir,
                        watchFiles
                    } : {
                        contents: (0, utils_1.makeModule)(css, type),
                        loader: 'js',
                        resolveDir,
                        watchFiles
                    };
                }
                catch (err) {
                    return {
                        errors: [{ text: err.message }],
                        watchFiles: (_a = watched === null || watched === void 0 ? void 0 : watched[path]) !== null && _a !== void 0 ? _a : [path]
                    };
                }
            }));
        }
    };
}
exports.sassPlugin = sassPlugin;
//# sourceMappingURL=plugin.js.map