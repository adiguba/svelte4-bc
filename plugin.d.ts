/**
 * Svelte4-BC vite plugin
 * @param {boolean?} show_logs
 * @returns { {name: string, config:(conf:any,env:any)=>void, transform: (code: string, id: string, options?: {ssr?:boolean})=>string|undefined}}
 */
export declare function svelte4BCPlugin(show_logs?: boolean | null): {
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
