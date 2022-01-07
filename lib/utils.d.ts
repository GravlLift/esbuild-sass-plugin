import { Type } from './index';
import { AcceptedPlugin } from 'postcss';
import PostcssModulesPlugin from 'postcss-modules';
import { BuildOptions, OnLoadResult } from 'esbuild';
import { Syntax } from 'sass';
export declare const RELATIVE_PATH: RegExp;
export declare function modulesPaths(): string[];
export declare function fileSyntax(filename: string): Syntax;
export declare type PluginContext = {
    instance: number;
    namespace: string;
    sourcemap: boolean;
    watched: {
        [path: string]: string[];
    } | null;
};
export declare function getContext(buildOptions: BuildOptions): PluginContext;
export declare function sourceMappingURL(sourceMap: any): string;
export declare function makeModule(contents: string, type: Type): string;
export declare type PostcssModulesParams = Parameters<PostcssModulesPlugin>[0] & {
    basedir?: string;
};
export declare function postcssModules(options: PostcssModulesParams, plugins?: AcceptedPlugin[]): (source: string, dirname: string, path: string) => Promise<OnLoadResult>;
