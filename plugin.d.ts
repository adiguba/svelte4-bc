export type Svelte4BPluginConfig = {
	/** Log transformed files */
	logs?: boolean;

	/** Enable a build report in specified file */
	report?: boolean;
}


/**
 * Svelte4-BC vite plugin
 * @param {boolean?} show_logs
 * @returns { {name: string, config:(conf:any,env:any)=>void, transform: (code: string, id: string, options?: {ssr?:boolean})=>string|undefined}}
 */
export declare function svelte4BCPlugin(options?: Svelte4BPluginConfig | boolean): {
	name: string;
	config: (conf: any, env: any) => void;
	transform: (
		code: string,
		id: string,
		options?: {
			ssr?: boolean;
		}
	) => string | undefined;
};
