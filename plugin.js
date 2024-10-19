import {promises as fs} from 'fs';

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
 * @typedef {{
 * 		slots: boolean,
 * 		cslots: boolean,
 * 		events: boolean,
 * 		cevents: boolean,
 * 		bubbles: boolean,
 * 		dispatcher: boolean,
 * 		bc: boolean
 * }} Stat
 * 
 * @typedef {(stats:Map<string,Stat>)=>string} Generator
 */



/**
 * @param {Map<string,Stat>} stats 
 * @param {string} name
 */
async function generate_report(stats, name) {
	let content = `<!doctype html>
<html>
<head>
<title>Svelte4-BC Report</title>
<style>
	table {
		width: 100%;
		border: 1px solid #000;
		border-spacing: 0;
	}
	thead {
		position: sticky;
		top: 0;
		background: #f1f1f1;
		color: #000;
		border: 1px solid red;
	}
	thead > tr > th {
		border-bottom: 1px solid #000;
	}
	td, th {
		padding: 4px;
		text-align: center;
	}
	td:first-child, th:first-child {
		text-align: left;
	}
	tbody > tr:nth-child(odd) {
		background-color: #f9f9f9;
	}
	tbody > tr:hover {
		background-color: #bae1ff;
	}
</style>
</head>
<body>
<h1>Svelte4-BC Report</h1>
<table>
<thead>
	<tr>
		<th>File</th>
		<th>&lt;slots/&gt;</th>
		<th>slot="*"</th>
		<th>bubbles</th>
		<th>on:event</th>
		<th>comp on:event</th>
		<th>dispatch</th>
		<th>BC</th>
	</tr>
</thead>
<tbody>
`;
	for (const [k, v] of stats.entries()) {
		content += `
	<tr>
		<td>${k}</td>
		<td>${v.slots?'🚫':'✅'}</td>
		<td>${v.cslots?'🚫':'✅'}</td>
		<td>${v.bubbles?'🚫':'✅'}</td>
		<td>${v.events?'🚫':'✅'}</td>
		<td>${v.cevents?'🚫':'✅'}</td>
		<td>${v.dispatcher?'🚫':'✅'}</td>
		<td>${v.bc?'🛠':''}</td>
	</tr>`
	}
	content += `
</tbody>
</table>
</body>
</html>`;
	return await fs.writeFile(name, content);
}


/**
 * Svelte4-BC vite plugin
 * @param {import("./plugin.js").Svelte4BPluginConfig|boolean} [conf]
 * @returns { {
 * 	name: string,
 * 	config:(conf:any,env:any)=>void,
 * 	transform: (code: string, id: string, options?: {ssr?:boolean})=>string|undefined,
 * 	buildStart: ()=>void,
 *  closeBundle: () => void,
 * }}
 */
export function svelte4BCPlugin(conf={}) {
	if (typeof conf === 'boolean') {
		conf = {logs: conf};
	}
	const regex = /function (.+)\(\$\$((anchor)|(payload)), \$\$props\) {/;
	const prefix = gray('[Svelte4-BC]');
	const server = blue('server');
	const client = blue('client');
	const show_logs = !!conf.logs;
	

	const $$slots_regexp = /\$\$slots: {[^}]*?{/gs

	let build = 0;
	const gen_report = !!conf.report;
	const report_name = './svelte4-bc-report.html'
	/** @type {Map<string,Stat>} */
	const stats = new Map();
	let is_dev = false;
	let mode = 'PROD';
	return {
		name: 'svelte4-bc', // required, will show up in warnings and errors
		config: (conf, env) => {
			is_dev = env.mode === 'development';
			mode = is_dev ? green('DEV') : (blue('PROD' + '/' + conf.build.ssr ? 'SSR' : 'client'));
			if (show_logs) {
				console.info(`${prefix} Build in ${mode} mode`);
			}
		},
		buildStart() {
			build++;
		},
		async closeBundle() {
			build--;
			if (build === 0 && gen_report) {
				await generate_report(stats, report_name);
				if (show_logs) {
					console.info(`${prefix} Generate report into ${green(report_name)}`);
				}
			}
		},
		transform(code, id, options) {
			if (!id.endsWith('.svelte') || id.includes("node_modules")) {
				return;
			}
			const bc = code.includes('\nexport const svelte4_bc =');
			if (gen_report) {
				const ssr = options?.ssr === true;

				let r = stats.get(id);
				if (!r) {
					r = {slots: false, cslots: false, bubbles: false, events: false, cevents: false, dispatcher: false, bc};
					stats.set(id, r);
				} 

				r.slots ||= code.includes('$.slot(');
				r.cslots ||= code.match($$slots_regexp)!==null;
				if (!ssr) {
					r.events ||=  code.includes('$.event(');
					r.cevents ||= code.includes('$$events:');
					r.bubbles ||= code.includes('$.bubble_event.call');
					r.dispatcher ||= code.includes('createEventDispatcher');
				}
			}
			if (bc) {
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
				// In dev mode $$props is a proxy, so he must be reassigned
				// This is useless in prod mode
				const assign = is_dev ? '$$props = ' : '';
				return (
					`import { ${import_name} } from "svelte4-bc";\n` +
					code.replace(regex, (match) => {
						return match + `${assign}${svelte4_bc_convert}($$props, svelte4_bc${componentName});`;
					})
				);
			}
		}
	};
}
