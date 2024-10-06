# Svelte 4 Backward Compatibility for Svelte 5

**svelte4-bc** is a plugin that improves Svelte 4 backwards compatibility in Svelte 5

> [!CAUTION]
> **Version under development - API may not be final**

## Goals

The purpose of this package is to enable a step-by-step migration of components, by maintaining backward compatibility from caller's code, even after converting a component to the new **Svelte 5** syntax (*snippets/handlers*).

## Why ?

**Svelte 5** is already backwards compatible with the **Svelte 4** syntax (*slots, on:events* directives), but only for **Svelte 4** components.

When a component is migrated to the new syntax (*snippet/handlers*), all the calling codes that use this component should also be migrated in order to replace *slots/on:events* by *snippets/handlers*.
This can be problematic on large projects, where we may want to make slower transitions.

**svelte4-bc** allows to use *snippets/handlers* within a component, while still accepting *slots/on:events* from the outside.

## How to install / configure ?

In a **Svelte 5** project, install the package **svelte4-bc** :
> npm i svelte4-bc

And edit the file `vite.config.js` in order to add the plugin :
```diff
import { sveltekit } from '@sveltejs/kit/vite';
+import { svelte4BCPlugin } from 'svelte4-bc/plugin';
import { defineConfig } from 'vite';

export default defineConfig({
-	plugins: [sveltekit()]
+	plugins: [sveltekit(), svelte4BCPlugin()]
});
```

This plugin will transform all `*.svelte` files all components whose exports a variable named **svelte4_bc** :

```svelte
<script module>
  export const svelte4_bc = {
    slots: {
      // slots config
    },
    events: {
      // events config
    }
  }
</script>
<script>
    // Your code
</script>
<!-- Your template -->
```

## Examples

### Basic Example

Let's take this simple **Svelte 4** component with a slot named `prefix` and an `on:click` event :
```svelte
<!-- Button.svelte -->
<button on:click>
	{#if $$slots.prefix}
		<span><slot name="prefix"/></span>
	{/if}
	<slot/>
</button>
```
The **Svelte 5** version of this component would be :
```svelte
<!-- Button.svelte -->
<script>
	let { onclick, prefix, children } = $props();
</script>

<button {onclick}>
	{#if prefix}
		<span>{@render prefix()}</span>
	{/if}
	{@render children?.()}
</button>
```

But now, this component requires the use of `snippets/handlers`, and `slots/on:events` will be ignored :

```svelte
<!-- This works -->
<Button onclick={onclick}>
	{#snippet prefix()}<i>(icon)</i>{/snippet}
	click
</Button>

<!-- This will compile normally, but slots/on:events will be ignored -->
<Button on:click={onclick}>
	<i slot="prefix">(icon)</i>
	click
</Button>
```

In order to "fix" this, we can add a `<script module>` with the configuration for **Svelte4-BC** :

```svelte
<script module>
  export const svelte4_bc = {
    slots: {
      // The slot 'prefix' will be mapped onto the prop 'prefix'
      prefix: true
    },
    events: {
      // The event 'click' will be mapped onto the prop 'onclick'
      click: true
    }
  }
</script>
```

Now, the `slots/on:events` declared on the config will not be ignored, and they will be mapped to the corresponding props.

See and try [the online demo on Stackblitz](https://stackblitz.com/edit/svelte4-bc?file=src%2Froutes%2F%2Bpage.svelte,src%2Froutes%2FButton.svelte)
(since this is a plugin for ViteJS, it cannot be tested on the Svelte5 REPL)

An alternative would be to use the function **Svelte4BCWrapper** to manually wrap a component.
See this [Demo REPL](https://svelte-5-preview.vercel.app/#H4sIAAAAAAAACu1XbW_bNhD-K4QdQDbqWO3SAIsia2vcDAOGIcA2YB_qYqAlymYrkQJJ28kE_feSPFIvjtMkn_ZlEAyId7y3h_cc5XqU04LIUfSpHjFcklE0-lBVo9lIPVRmIfekUESvJd-J1EhimQpaqWTF9KNoWXGh0BKL7E-79T3KBS9RMA97sjm4Ca5PmlyeMLl8xuRmecroZjn_IsEE0ks5kwqleodEC_Spl9Ks7202dP3Ze1AFUSijuOCba78siZR4Q7S7M6mwIpPpNcTKdyxVlDMkt_zwO89wMSmnqLauVGdVgnMFbufdZiV2xPpSzZFDztKCpl8nZK9ah51d4NQoQgF6g8ymp7zspOLld9xY_Uk_cdg79hhyR2vKskhtqVzUIGmMWsVVUrt6mzisQLbeKdWVsqgn00XiIEgLLjWMTXL3WxzCvsREBLWPuEdpgaVcBBtBs0BL6zHB6dYdLpb2CBsbS29OoLw45RlJaqOam_bW-VgJ2knKNkgyWlVEyXCLWVYQIVEEds7a2KHa5dzYNwtR49yvVD12PtCW4IwIXYZXrdSvtx8-3v6BJm7LtDUKncQdkXnSLS0yQdr14wA55-oowC93d389G8AUYkkCBxE6dF4HVME1SpxFZE-YamECgLTYHWqLlBFZpBYnMIuB2lEu8KbU7qz3xWoECK5GyQkE9Q6fytC4rVl36FCTdOBmJMe7AgIdAxzLCjOfAmA8SMFj3AHRD6ltk6cx1kHq0HRpA_0MwMdSPRTE6rVobvrZ0zGjsirwQ4SM0A0K83quSKkVipynvNiVTEboXS7Mz2_CVYQufqju0Y_Vvaetzs9G0uO75BnNKclGkRkzzayd9r2R-MKp76dxjVJBdEq3piU-6sSxbmIiUOMmc2-AayNyb43MBOUVYXoQ5riQ5Lo_pzPnRCtPun48anMqyBKm2rSPodk_CaDxgpkmrg4Z2cDNtIeOr6k_Xsw8CWyd9Zjm6OzM9v4cmtPzCVZJbPvSINlr3zCJQ6e3XkKaw1gqMW2bpR2HQJ3EFNKuelPw1OZF3ZXddJZ2fWy6FaF_NbmGrj_bVAY1Qvf7GmE1rNHzw9To9L0an2zx1M5R8LvmQkMTIdOrkhe698dXV1eujdc4_boRfKfvFTTO35nHaXTfc201vri4cBK-JyIv-CFCW5plhLWXlQL0Z25i-sAVzjJN4Qi9RW_nl4L4izjnTJ1L-i-JjLwVD1LpMvR55Hnetz8QutmqCK15kXWJGJgfh--Cv5qjly_iaPvp4kKbvp_Bq4PG1eLunJkvxMDlFm6UdyvbXjZp8-lTCV7Jl_HR2_40nzByQKC2zJ4E9jo53-NiR4LpK5nZY6TnY_2zrka_dJfxy6nYXl6eUd-n4tNMfI6IbZIefg0MXOrHvDzJx9Yc1tb4fzL-J2S8WXZ0_CL7VHz1f5z2TnV38c3yb4H1F9zxdfr-fJ26K5XBpenk_6xTzUtbnh3mkS8V8I-QKWNAdBDZyq0cPu1aO9vgAzNo7J7ZijVdHgeX7-JRCZPBP60u3xkKBmAGME7cl4L_Zmtny2DvBLN0y3Vb2UHkZo1L4UinnTaPD_Rz8w2QaZ5N-w4AAA==)

### Name conflict

On **Svelte 4**, `slots` and `on:events` have their own namespaces separate from the props namespace.

```svelte
<!-- Svelte 4 -->
<script>
	export let title;
</script>
<slot name="title" />
```

So we can encounter conflicts when migrating to Svelte 5, requiring to rename the snippets/handlers.

```svelte
<!-- Svelte 5 -->
<script>
	let { title, title_snippet } = $props();
</script>
{@render title_snippet?.()}
```

We can use the config to define a new name for the slots/on:events :

```svelte
<script module>
  export const svelte4_bc = {
    slots: {
      // The slot 'title' will be mapped onto the prop 'title_snippet'
      title: "title_snippet"
    }
  }
</script>
```

### Slot's parameters

In **Svelte 4**, the slot variables are managed via an object :

```svelte
<!-- Svelte 4 -->
<slot name="header" {title} {option} />
```

So a slot with parameters will have to be migrated to a snippet with an single object with the specified properties :

```svelte
<!-- Svelte 5 -->
<script>
	let { header } = $props();
</script>

{@render header?.({ title, option })}
```

This is also the default behavior of this plugin.

But it is still possible to use multiples parameters, by configuring this plugin to remap the slot variables to the correct parameters :
```svelte
<script module>
  export const svelte4_bc = {
    slots: {
      // The slot 'header' will be mapped onto the prop 'header'
      // The first param will be mapped to the slot variable 'title'
      // The second param will be mapped to the slot variable 'option'
      header: ['title', 'option']
    }
  }
</script>
<!-- Svelte 5 -->
<script>
	let { header } = $props();
</script>

{@render header?.(title, option)}
```

> [!TIP]
> It is possible to use an object to define both the props and parameters of a slot :
> 
>```svelte
><script module>
>  export const svelte4_bc = {
>    slots: {
>      header: {
>        // The slot 'header' will be mapped onto the prop 'new_name'
>        prop: 'new_name',
>        // The first param will be mapped to the slot variable 'title'
>        // The second param will be mapped to the slot variable 'option'
>        args: ['title', 'option']
>    }
>  }
> </script>
> ```





### Event dispatcher

> *TODO*
