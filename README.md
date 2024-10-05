# Svelte 4 Backward Compatibility for Svelte 5

**svelte4-bc** is a plugin that improves Svelte 4 backwards compatibility in Svelte 5

> [!CAUTION]
> **Version under development - API may not be final**

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
+import { svelte4BC } from 'svelte4-bc';
import { defineConfig } from 'vite';

export default defineConfig({
-	plugins: [sveltekit()]
+	plugins: [sveltekit(), svelte4BC()]
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
