/** @import { Svelte4BCConfig, Svelte4BCPropConfig, Svelte4BCEventConfig, Svelte4BCEventWrapper } from "./index.js" */

/**
 * Internal définition for Svelte $$props :
 * @typedef {Record<string,any> & 
 * 	{
 * 		$$slots?: Record<string, true | Function>,
 * 		$$events?: Record<string, EventListener | Array<EventListener>>
 * 	}} Props
 */

import { BROWSER, DEV } from "esm-env";
import { handlers } from "svelte/legacy";


/**
 * @param {Props} props
 * @param {string} [comp] the component name
 */
function verify_slots(props, comp) {
	if (props.$$slots) {
		for (const name of Object.getOwnPropertyNames(props.$$slots)) {
			if (props.$$slots[name] !== true) {
				console.error(`[Svelte4-BC] Illegal slot "${name}" for component ${comp}`);
			}
		}
	}
}

/**
 * @param {Props} props
 * @param {string} [comp] the component name
 */
function verify_events(props, comp) {
	if (props.$$events) {
		for (const name of Object.getOwnPropertyNames(props.$$events)) {
			console.error(`[Svelte4-BC] Illegal directive "on:${name}" for component ${comp}`);
		}
	}
}

/**
 * @param {Function} slot The slot function
 * @param {string[]} args the args name
 * @returns {(anchor:any,...params:any)=>void}
 */
function create_slot_wrapper(slot, args) {
	if (args.length === 0) {
		return (anchor, ...params) => {
			let slotParams;
			if (params.length > 1 && params[0] != null && typeof params[0] === 'object') {
				if (BROWSER) {
					slotParams = new Proxy({}, {
						get(target, prop, receiver) {
							return Reflect.get(params[0](), prop, receiver);
						}
					});
				} else {
					slotParams = params[0];
				}
			} else {
				slotParams = {};
			}
			slot(anchor, slotParams);
		}
	}
	return (anchor, ...params) => {
		/** @type {Record<string,any>} */
		const slotParams = {};
		const max = params.length;
		args.forEach((name, index) => {
			if (name && index < max) {
				if (BROWSER) {
					Object.defineProperty(slotParams, name, { get: ()=>params[index] });
				} else {
					slotParams[name] = params[index];
				}
			}
		});
		slot(anchor, slotParams);
	}
}

/**
 * @param {Props} props
 * @param {Record<string, boolean | string | string[] | Svelte4BCPropConfig>} metadata
 * @param {string} [comp] the component name
 */
function populate_slots(props, metadata, comp) {
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
			if (DEV) {
				console.error(`[Svelte4-BC] Illegal slot "${name}" for component ${comp}`);
			}
			continue;
		}

		if (!is_default && prop in props) {
			// Conflict between slot and prop
			if (DEV) {
				console.error(`[Svelte4-BC] Conflict between slot="${name}" and prop '${prop}' for component ${comp}`);
			}
			continue;
		}

		if (DEV) {
			console.warn(`[Svelte4-BC] slot "${name}" mapped into prop "${prop}" for component ${comp}`);
		}

		const slot = /** @type {Function} */ (props.$$slots[name]);
		props[prop] = create_slot_wrapper(slot, args);
	}
}

/**
 * 
 * @param {Array<Svelte4BCEventWrapper>} wrappers 
 * @returns {Svelte4BCEventWrapper}
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
 * @param {false | undefined | Record<string, boolean | string | Svelte4BCEventWrapper | Array<Svelte4BCEventWrapper> | Svelte4BCEventConfig>} metadata
 * @return {[string | null, Svelte4BCEventWrapper | null ]}
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
 * @param {Props} props
 * @param {Record<string, boolean | string | Svelte4BCEventWrapper | Array<Svelte4BCEventWrapper> | Svelte4BCEventConfig>} metadata
 * @param {string} [comp] the component name
 */
function populate_events(props, metadata, comp) {
	if (props.$$events === undefined) {
		return;
	}
	for (const name of Object.getOwnPropertyNames(props.$$events)) {
		const [prop, wrap] = get_event(name, metadata);

		if (prop == null) {
			// event is invalid
			if (DEV) {
				console.error(`[Svelte4-BC] Illegal directive "on:${name}" for component ${comp}`);
			}
			continue;
		}

		if (prop in props) {
			// Conflict between slot and prop
			if (DEV) {
				console.error(`[Svelte4-BC] Conflict between directive "on:${name}" and prop '${prop}' for component ${comp}`);
			}
			continue;
		}

		if (DEV) {
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
 * @param {Props} props
 * @param {false | undefined | Record<string, boolean | string | Svelte4BCEventWrapper | Array<Svelte4BCEventWrapper> | Svelte4BCEventConfig>} metadata
 * @param {string} [comp] the component name
 */
function create_dispatch_proxy(props, metadata, comp) {
	props.$$events = new Proxy(props.$$events ?? {}, {
		get(target, p, receiver) {
			if (typeof p === 'string') {
				const [prop, wrap] = get_event(p, metadata);
				if (prop == null) {
					// event is invalid
					if (DEV) {
						console.error(`[Svelte4-BC] Illegal dispatch("${p}") for component ${comp}`);
					}
					return undefined;
				}
				if (DEV) {
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
}

/**
 * @param {Props} props
 * @param {string} [comp] the component name
 */
function verify_dispatch(props, comp) {
	props.$$events = new Proxy(props.$$events ?? {}, {
		get(target, prop, receiver) {
			console.error(`[Svelte4-BC] Illegal dispatch of event "on:${prop.toString()}" for component ${comp}`);
		}
	});
}

/**
 * DEV Proxy in order to support HMR
 * @param {Props} props the props
 */
function create_DEV_proxy(props) {
	return new Proxy({}, {
		get(target, p, receiver) {
			return Reflect.get(target, p, receiver) ?? Reflect.get(props, p, receiver);
		},
		ownKeys(target) {
			return [...Reflect.ownKeys(props).filter(p => !(p in target)), ...Reflect.ownKeys(target)];
		},
		has(target, p) {
			return Reflect.has(target, p) || Reflect.has(props, p);
		},
		getOwnPropertyDescriptor(target, p) {
			return Reflect.getOwnPropertyDescriptor(target, p) ?? Reflect.getOwnPropertyDescriptor(props, p);
		}
	});
}

/**
 * Svelte4-BC converter
 * @param {Props} props the props
 * @param {Svelte4BCConfig} config the svelte4_bc config
 * @param {string | undefined} [comp]
 * @returns {Props} 
 */
export function svelte4_bc_convert(props, config, comp) {
	if (DEV && BROWSER) {
		// In DEV Mode, we have to use a proxy to support HMR
		props = create_DEV_proxy(props);
	}
	if (config !== false) {
		if (config.slots) {
			populate_slots(props, config.slots, comp);
		} else if (DEV && config.slots === false) {
			verify_slots(props, comp);
		}
		if (BROWSER) {
			if (config.events) {
				populate_events(props, config.events, comp);
			} else if (DEV && config.events === false) {
				verify_events(props, comp);
			}
			if (config.dispatch) {
				create_dispatch_proxy(props, config.events, comp);
			} else if (DEV) {
				verify_dispatch(props, comp);
			}
		}
	} else if (DEV) {
		verify_slots(props);
		if (BROWSER) {
			verify_events(props, comp);
			verify_dispatch(props, comp);
		}
	} 
	return props;
}

/**
 * @template {import("svelte").Component} T
 * @param {T} comp 
 * @param {Svelte4BCConfig} config
 * @returns {T}
 */
export function Svelte4BCWrapper(comp, config) {
	return /** @type {T} */ (($$anchor, $$props) => {
		return comp($$anchor, svelte4_bc_convert($$props, config, comp.name));
	});
}
