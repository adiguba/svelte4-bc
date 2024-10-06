/**
 * @param {string} txt
 * @returns {string}
 */
function gray(txt) {
	return '\x1b[30m' + txt + '\x1b[0m';
}

/**
 * @param {string} txt
 * @returns {string}
 */
function blue(txt) {
	return '\x1b[36m' + txt + '\x1b[0m';
}
/**
 * @param {string} txt
 * @returns {string}
 */
function green(txt) {
	return '\x1b[32m' + txt + '\x1b[0m';
}

/**
 * Svelte4-BC vite plugin
 * @param {boolean?} show_logs
 * @returns { {name: string, config:(conf:any,env:any)=>void, transform: (code: string, id: string, options?: {ssr?:boolean})=>string|undefined}}
 */
export function svelte4BCPlugin(show_logs = false) {
	const regex = /function (.+)\(\$\$((anchor)|(payload)), \$\$props\) {/;
	const prefix = gray('[Svelte4-BC]');
	const server = blue('server');
	const client = blue('client');

	let is_dev = false;
	let mode = 'PROD';
	return {
		name: 'svelte4-bc', // required, will show up in warnings and errors
		config: (conf, env) => {
			is_dev = env.mode === 'development';
			mode = is_dev ? green('DEV') : blue('PROD');
			if (show_logs) {
				console.info(`${prefix} Build in ${mode} mode`);
			}
		},
		transform(code, id, options) {
			if (id.endsWith('.svelte') && code.includes('\nexport const svelte4_bc =')) {
				if (show_logs) {
					const ssr = options?.ssr === true;
					console.info(`${prefix} Transform ${ssr ? server : client}/${mode} for ${blue(id)}`);
				}

				if (code.includes('$.slot(')) {
					throw new Error('Cannot use both `svelte4_bc` and `<slot/>` !');
				}
				if (code.includes('$.event(')) {
					throw new Error('Cannot use both `svelte4_bc` and `on:event` directive !');
				}

				let import_name = 'svelte4_bc_convert';
				let svelte4_bc_convert = import_name;
				while (code.includes(svelte4_bc_convert)) {
					svelte4_bc_convert += '1';
				}
				if (svelte4_bc_convert != import_name) {
					import_name += ' as ' + svelte4_bc_convert;
				}
				const componentName = is_dev ? `, "${id.replaceAll('"', '_')}"` : '';
				return (
					`import { ${import_name} } from "svelte4-bc";\n` +
					code.replace(regex, (match) => {
						// TODO : remove $$props = in production mode ?
						return match + `$$props = ${svelte4_bc_convert}($$props, svelte4_bc${componentName});`;
					})
				);
			}
		}
	};
}
