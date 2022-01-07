import { SassPluginOptions } from './index';
export declare type RenderSync = (path: string) => RenderResult;
export declare type RenderResult = {
    css: string;
    watchFiles: string[];
};
export declare function createRenderer(options: SassPluginOptions | undefined, sourcemap: boolean): RenderSync;
