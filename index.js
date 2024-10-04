/** @import { Svelte4BC_Config, Svelte4BC_PropConfig, Svelte4BC_EventConfig, Svelte4BC_EventWrapper } from "./index.js" */
/** @import { Props } from "./internal.js" */


/**
 * @param {string} comp the component name
 * @param {Props} props
 */
function throw_error_on_slots(comp, props) {
	if (props.$$slots) {
		for (const name of Object.getOwnPropertyNames(props.$$slots)) {
			// the default slot is already managed by Svelte 5
			if (name !== 'default') {
				throw new Error(`[Svelte4-BC] Illegal slot "${name}" for component ${comp}`);
			}
		}
	}
}

/**
 * @param {string} comp the component name
 * @param {Props} props
 */
function throw_error_on_events(comp, props) {
	if (props.$$events) {
		for (const name of Object.getOwnPropertyNames(props.$$events)) {
			throw new Error(`[Svelte4-BC] Illegal directive "on:${name}" for component ${comp}`);
		}
	}
}


/**
 * @param {any} param 
 * @param {boolean} ssr
 */
function create_slot(param, ssr) {
	if (param == null) {
		return {};
	}
	if (ssr) {
		return param;
	}
	return new Proxy({}, {
		get(target, prop, receiver) {
			return Reflect.get(param(), prop, receiver);
		}
	})
}

/**
 * @param {string} comp the component name
 * @param {Props} props
 * @param {Record<string, boolean | string | string[] | Svelte4BC_PropConfig>} metadata
 * @param {boolean} ssr
 */
function populate_slots(comp, props, metadata, ssr) {
	if (props.$$slots === undefined) {
		return;
	}
	for (const name of Object.getOwnPropertyNames(props.$$slots)) {

		
		// snippets put true on slots
		if (props.$$slots[name] === true) {
			continue;
		}

		const is_default = name === 'default';

		const meta = metadata[name] ?? false;

		/** @type {string} */
		let prop = is_default ? 'children' : name;
		/** @type {string[] | null} */
		let args = null;

		if (meta === true) {
			args = [];
		} else if (meta !== false) {
			switch (typeof meta) {
				case 'string':
					prop = meta;
					args = [];
					break;
				case 'object':
					if (Array.isArray(meta)) {
						args = meta;
					} else {
						prop = meta.prop;
						args = meta.args;
					}
			}
		}

		if (prop == null || args == null) {
			// no args : slot is invalid
			throw new Error(`[Svelte4-BC] Illegal slot "${name}" for component ${comp}`);
		}

		if (!is_default && prop in props) {
			// Conflict between slot and prop
			throw new Error(`[Svelte4-BC] Conflict between slot="${name}" and prop '${prop}' for component ${comp}`);
		}

		if (/** @type {any} */(import.meta).hot) {
			console.warn(`[Svelte4-BC] slot "${name}" mapped into prop "${prop}" for component ${comp}`);
		}

		const slot = /** @type {Function} */ (props.$$slots[name]);

		if (args.length === 0) {
			props[prop] = /** @type {($$anchor:any,...params:any)=>void}) */ (($$anchor, ...params) => {
				const slots = (params.length>0) ? create_slot(params[0], ssr) : {};
				slot($$anchor, slots);
			});
		} else {
			props[prop] = /** @type {($$anchor:any,...params:any)=>void}) */ (($$anchor, ...params) => {
				const slot_props = {};
				const max = params.length;
				args.forEach((name, index) => {
					if (name && index < max) {
						const get = ssr ? ()=>params[index] : params[index];
						Object.defineProperty(slot_props, name, { get });
					}
				});
				slot($$anchor, slot_props);
			});
		}
	}
}

/**
 * 
 * @param {Array<Svelte4BC_EventWrapper>} wrappers 
 * @returns {Svelte4BC_EventWrapper}
 */
function wrap_all(wrappers) {
	return (fn) => {
		for (const wrap of wrappers) {
			fn = wrap(fn);
		}
		return fn;
	}
}

/**
 * Return the translated name of the event
 * @param {string} name 
 * @param {false | undefined | Record<string, boolean | string | Svelte4BC_EventWrapper | Array<Svelte4BC_EventWrapper> | Svelte4BC_EventConfig>} metadata
 * @return {[string | null, Svelte4BC_EventWrapper | null ]}
 */
function get_event(name, metadata) {
	let prop = null;
	let wrap = null;
	if (metadata) {
		const meta = metadata[name] ?? false;

		if (meta === false) {
			prop = null;
		} else if (meta === true) {
			prop = 'on' + name;
		} else {
			switch (typeof meta) {
				case 'string':
				case 'function':
					prop = 'on' + name;
					break;
				case 'object':
					if (Array.isArray(meta)) {
						prop = 'on' + name;
					} else {
						prop = meta.prop;
						wrap = meta.wrap;
					}
			}
		}
		if (wrap && Array.isArray(wrap)) {
			wrap = wrap_all(wrap);
		}
	}
	return [prop, wrap];
}

/**
 * Function to mimic the multiple listeners available in svelte 4
 * TODO : import from "svelte/legacy" ?
 * @param {EventListener[]} handlers
 * @returns {EventListener}
 */
export function handlers(...handlers) {
	return function (event) {
		const { stopImmediatePropagation } = event;
		let stopped = false;

		event.stopImmediatePropagation = () => {
			stopped = true;
			stopImmediatePropagation.call(event);
		};

		for (const handler of handlers) {
			try {
				// @ts-expect-error `this` is not typed
				handler?.call(this, event);
			} catch (e) {
				window.reportError(e);
			}
			if (stopped) {
				break;
			}
		}
	};
}

/**
 * @param {string} comp the component name
 * @param {Props} props
 * @param {Record<string, boolean | string | Svelte4BC_EventWrapper | Array<Svelte4BC_EventWrapper> | Svelte4BC_EventConfig>} metadata
 */
function populate_events(comp, props, metadata) {
	if (props.$$events === undefined) {
		return;
	}
	for (const name of Object.getOwnPropertyNames(props.$$events)) {
		const [prop, wrap] = get_event(name, metadata);

		if (prop == null) {
			// event is invalid
			throw new Error(`[Svelte4-BC] Illegal directive "on:${name}" for component ${comp}`);
		}

		if (prop in props) {
			// Conflict between slot and prop
			throw new Error(`[Svelte4-BC] Conflict between directive "on:${name}" and prop '${prop}' for component ${comp}`);
		}

		if (/** @type {any} */(import.meta).hot) {
			console.warn(`[Svelte4-BC] directive "on:${name}" mapped into prop "${prop}" for component ${comp}`);
		}

		let event = props.$$events[name];
		if (Array.isArray(event)) {
			event = handlers(...event)
		}
		if (wrap) {
			event = wrap(event);
		}
		props[prop] = event;
	}

}


/**
 * @param {string} comp the component name
 * @param {Props} props
 * @param {false | undefined | Record<string, boolean | string | Svelte4BC_EventWrapper | Array<Svelte4BC_EventWrapper> | Svelte4BC_EventConfig>} metadata
 */
function create_dispatch_proxy(comp, props, metadata) {
	const value = new Proxy(props.$$events ?? {}, {
		get(target, p, receiver) {
			if (typeof p === 'string') {
				const [prop, wrap] = get_event(p, metadata);
				if (prop == null) {
					// event is invalid
					throw new Error(`[Svelte4-BC] Illegal dispatch("${p}") for component ${comp}`);
				}
				if (/** @type {any} */(import.meta).hot) {
					console.warn(`[Svelte4-BC] dispatch("${p}") mapped into prop "${prop}" for component ${comp}`);
				}
				let event = props[prop];
				if (event && wrap) {
					event = wrap(event);
				}
				return event;
			}
			return Reflect.get(target, p, receiver);
		}
	});
	Object.defineProperty(props, '$$events', { value, enumerable: false});
}

/**
 * @param {string} comp the component name
 * @param {Props} props
 */
function throw_error_on_dispatch(comp, props) {
	props.$$events = new Proxy(props.$$events ?? {}, {
		get(target, prop, receiver) {
			throw new Error(`[Svelte4-BC] Illegal dispatch of event "on:${prop.toString()}" for component ${comp}`);
		}
	});
}

const hmr_already_converted = Symbol();

/**
 * Svelte4-BC converter
 * @param {Props & {[hmr_already_converted]?:boolean}} props the props
 * @param {Svelte4BC_Config} config the svelte4_bc config
 * @param {string} comp
 * @param {boolean | undefined} ssr
 */
export function svelte4_bc_convert(props, config, comp='?', ssr=false) {
	if (/** @type {any} */(import.meta).hot) {
		if (props[hmr_already_converted]) {
			console.warn(`[Svelte4-BC] Convert slots/on:event for ${comp} is ignored on Hot-Module-Reload`);
			return;
		}
		console.info(`[Svelte4-BC] Convert slots/on:event for ${comp}`);
		props[hmr_already_converted] = true;
	}
	if (config === false) {
		throw_error_on_events(comp, props);
		throw_error_on_slots(comp, props);
		throw_error_on_dispatch(comp, props);
	} else {
		if (config.events) {
			populate_events(comp, props, config.events);
		} else if (config.events === false) {
			throw_error_on_events(comp, props);
		}
		if (config.slots) {
			populate_slots(comp, props, config.slots, ssr);
		} else if (config.slots === false) {
			throw_error_on_slots(comp, props);
		}

		if (config.no_dispatch) {
			throw_error_on_dispatch(comp, props);
		} else {
			create_dispatch_proxy(comp, props, config.events);
		}
	}
}


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
export function svelte4BC(show_logs = false) {
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
				const ssr = options?.ssr === true;
				if (show_logs) {
					console.info(`${prefix} Transform ${ssr ? server : client}/${mode} for ${blue(id)}`);
				}
				let import_name = 'svelte4_bc_convert';
				let svelte4_bc_convert = import_name;
				while (code.includes(svelte4_bc_convert)) {
					svelte4_bc_convert += '1';
				}
				if (svelte4_bc_convert != import_name) {
					import_name += ' as ' + svelte4_bc_convert;
				}
				let args = '';
				if (is_dev) {
					args = `, "${id.replaceAll('"','_')}"`;
					if (ssr) {
						args += ", true";
					}
				}
				return `import { ${import_name} } from "svelte4-bc";\n` +
					code.replace(regex, (match, func) => {
						const comp_name = is_dev ? `"${id.replaceAll('"','_')}"`: (func + '.name');
						return match + ` ${svelte4_bc_convert}($$props, svelte4_bc${args});`
					});
			}
		}
	}
}