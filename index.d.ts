
type Svelte4BC_PropConfig = {
    prop: name;
    args: string[];
}

type Svelte4BC_EventWrapper = (fn: EventListener) => EventListener

type Svelte4BC_EventConfig = {
    prop: name;
    wrap: Svelte4BC_EventWrapper | Array<Svelte4BC_EventWrapper>;
}

export type Svelte4BC_Config = false | {
    slots?: false | Record<string, boolean | string | string[] | Svelte4BC_PropConfig>;
    events?: false | Record<string, boolean | string | Svelte4BC_EventWrapper | Array<Svelte4BC_EventWrapper> | Svelte4BC_EventConfig>;
    no_dispatch?: boolean;
}

/**
 * Svelte4-BC vite plugin
 * @param {boolean?} show_logs
 * @returns { {name: string, config:(conf:any,env:any)=>void, transform: (code: string, id: string, options?: {ssr?:boolean})=>string|undefined}}
 */
export function svelte4BC(show_logs?: boolean | null): {
    name: string;
    config: (conf: any, env: any) => void;
    transform: (code: string, id: string, options?: {
        ssr?: boolean;
    }) => string | undefined;
};
