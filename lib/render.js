"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRenderer = void 0;
const path_1 = require("path");
const fs_1 = __importStar(require("fs"));
const utils_1 = require("./utils");
const sass = __importStar(require("sass"));
const url_1 = require("url");
function createRenderer(options = {}, sourcemap) {
    const loadPaths = options.loadPaths;
    function resolveImport(pathname, ext) {
        if (ext) {
            let filename = pathname + ext;
            if (fs_1.default.existsSync(filename)) {
                return filename;
            }
            const index = filename.lastIndexOf(path_1.sep);
            filename = index >= 0 ? filename.slice(0, index) + path_1.sep + '_' + filename.slice(index + 1) : '_' + filename;
            if (fs_1.default.existsSync(filename)) {
                return filename;
            }
            return null;
        }
        else {
            if (!fs_1.default.existsSync((0, path_1.dirname)(pathname))) {
                return null;
            }
            return resolveImport(pathname, '.scss')
                || resolveImport(pathname, '.css')
                || resolveImport(pathname, '.sass')
                || resolveImport(pathname + path_1.sep + 'index');
        }
    }
    function resolveRelativeImport(loadPath, filename) {
        const absolute = (0, path_1.resolve)(loadPath, filename);
        const pathParts = (0, path_1.parse)(absolute);
        if (pathParts.ext) {
            return resolveImport(pathParts.dir + path_1.sep + pathParts.name, pathParts.ext);
        }
        else {
            return resolveImport(absolute);
        }
    }
    const requireOptions = { paths: ['.', ...loadPaths] };
    return function (path) {
        const basedir = (0, path_1.dirname)(path);
        let source = fs_1.default.readFileSync(path, 'utf8');
        if (options.precompile) {
            source = options.precompile(source, path);
        }
        const syntax = (0, utils_1.fileSyntax)(path);
        if (syntax === 'css') {
            return { css: (0, fs_1.readFileSync)(path, 'utf-8'), watchFiles: [path] };
        }
        const { css, loadedUrls, sourceMap } = sass.compileString(source, {
            ...options,
            syntax,
            importer: {
                load(canonicalUrl) {
                    const filename = path_1.sep === '/' ? canonicalUrl.pathname : canonicalUrl.pathname.slice(1);
                    let contents = fs_1.default.readFileSync(filename, 'utf8');
                    if (options.precompile) {
                        contents = options.precompile(contents, filename);
                    }
                    return {
                        contents,
                        syntax: (0, utils_1.fileSyntax)(filename),
                        sourceMapUrl: sourcemap ? (0, url_1.pathToFileURL)(filename) : undefined
                    };
                },
                canonicalize(url) {
                    let filename;
                    if (url.startsWith('~')) {
                        filename = url.slice(1);
                        try {
                            requireOptions.paths[0] = basedir;
                            filename = require.resolve(filename, requireOptions);
                        }
                        catch (ignored) {
                        }
                    }
                    else if (url.startsWith('file://')) {
                        filename = path_1.sep === '/' ? url.slice(7) : url.slice(8);
                        let joint = filename.lastIndexOf('/~');
                        if (joint >= 0) {
                            const basedir = filename.slice(0, joint);
                            filename = filename.slice(joint + 2);
                            try {
                                requireOptions.paths[0] = basedir;
                                filename = require.resolve(filename, requireOptions);
                            }
                            catch (ignored) {
                            }
                        }
                    }
                    else {
                        filename = url;
                    }
                    if (options.importMapper) {
                        filename = options.importMapper(filename);
                    }
                    let resolved = resolveRelativeImport(basedir, filename);
                    if (resolved) {
                        return (0, url_1.pathToFileURL)(resolved);
                    }
                    for (const loadPath of loadPaths) {
                        resolved = resolveRelativeImport(loadPath, filename);
                        if (resolved) {
                            return (0, url_1.pathToFileURL)(resolved);
                        }
                    }
                    return null;
                }
            },
            sourceMap: sourcemap
        });
        const cssText = css.toString();
        return {
            css: sourcemap ? `${cssText}\n${(0, utils_1.sourceMappingURL)(sourceMap)}` : cssText,
            watchFiles: [path, ...loadedUrls.map(url => path_1.sep === '/' ? url.pathname : url.pathname.slice(1))]
        };
    };
}
exports.createRenderer = createRenderer;
//# sourceMappingURL=render.js.map