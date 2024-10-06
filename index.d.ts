import { Component } from 'svelte';

type Svelte4BCPropConfig = {
	prop: name;
	args: string[];
};

type Svelte4BCEventWrapper = (fn: EventListener) => EventListener;

type Svelte4BCEventConfig = {
	prop: name;
	wrap: Svelte4BCEventWrapper | Array<Svelte4BCEventWrapper>;
};

export type Svelte4BCConfig =
	| false
	| {
			slots?: false | Record<string, boolean | string | string[] | Svelte4BCPropConfig>;
			events?:
				| false
				| Record<
						string,
						| boolean
						| string
						| Svelte4BCEventWrapper
						| Array<Svelte4BCEventWrapper>
						| Svelte4BCEventConfig
				  >;
			dispatch?: boolean;
	  };

export declare function Svelte4BCWrapper<T extends Component>(
	Component: T,
	config: any,
	componentName?: string
): T;
