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

> [!TIP]
> See this [demo REPL](https://svelte-5-preview.vercel.app/#H4sIAAAAAAAACu1Y3W7jRBR-laO0UhKRxl3aStR1AttsV0gIVQIkLrYrNLbH8ew6M9bMJGkxvuQlEBIPwFvxBDwC82tPsuluyw03qKpkn5nz830-f20zKEiFxSB-0wwoWuFBPHhZ14PJQD7U-kVscCWxehdszTMtSUTGSS3nd1T9SLKqGZewQDz_3lw9h4KzFQynUSCbWjPDq4MqFwdULj6hcr04pHS9mL4TVsWGlzEqJGTqhoAZvAlCmoTWJrum33oLssIScoIqtrzyryssBFpiZe5YSCTxaHxlfRVrmknCKIiSbb9lOapGqzE0xpTstVbWuLRmp_1lydfY2JLtnkFGs4pk70d4IzuDvd7QHUMMQ_gM9KXHrKyFZKuPmDHnB-0kUfDZExs7pITmsSyJmDVW0upjmdTzxuFtk6i2snQtZQ9l1ozGs7mjIKuYUDS289tvksjem2uP9tgmGk1KjHLMvQMbfZKxHM-Dr5pERgJEAIIknVsxKHk6h4ypNKKYSgGyRBLWAoO1IComhdOdhKYZjU283m66TtOK0OUEEM2dcsaxSoObjTL8iogayazEfDR2KlNnLuXR_K_ffwXjCn4B9eyN2zdBSV1jc_b3H7_96YgycD2Hj8G-CGDLEoNQhdyjhS0nUmIKWyLLgJQLQ4p4oBLdO9Ac1xXKFD5IiCUlUkFiDU3RQxT-B8-Yi9Z77uko1WOFuT8J4GtYHX6L8RECDDnPwH-92GOgB_8oV1uOlLscCFWpou8jSVJSEfkAFXrA_N98uENxJ1GfuTRZIaKTuznCKCtdY0LCtB9Xr6q4Njs4G3041c259bGvhf5Gex8IYqel74OPcda4iFojMhVuZOapdZ6Ulu23ccHRcqWJ09ZndwMb_N2gu3gnv755-ermOxjpGz6UXeVxZzXaO3FjwzRAXKB1ZR11xrtoakR9CAVjci-E17e3P-gQeiJCl0rXM2img82eqCP2eSy7zxv5xPY8h2z3JB-gtjlyNsCSqVrdATLtlQ5GEzlJ2zOWlaTKOab7bPUOLFU7DjxVH3VwmKom0lna6hx2easehXyobFlbNH6SFIzKE0F-xjG8-Ly-d1OuRnmuWIzhvBOlKHu_5GytZgccFS_0jzvJWMW4Ep6ennaTR2rP3keu-qsqzhiWnOROST-eSLxSBxKfKBPrFRUqhoLrX38J1TGcqbDgCxeHQWWxqO1mxXJSEJwPYj2F20m3DAWz5YlLkV9WGjg4GKB1i0uw3yglfG-U9ILBatWrZ1CgSuCrcI3JnRF1-MjM2d9ECsLxwg79ccihvj8a2jwdTlTOKpexcdyOA3Y8Jl0skFVIiNlQt6yhwdkckQKOj00Xmtpc8KnkOl5iOoRmMmgk0TzsiCoNSWHUfGu0TddvC7aJzTUQ6IdxtyQcujxrethtr2ne91VL1dzdo441cunfhbKD0RaXx2jfdjH6TqUxuvMAY9eBwiJSomlmWoirDsYVNTHoXBWsIjkcXV5ePrl0zs7OnIRtMC8qto2hJHmOaV9Rlv2JaxbecVepp3A6veDY76lBXSt5J94JpY_Qx1EURai_xWRZyhhSVuWHS7t33zt_do1ePKlGu83eudZ57xYgR43D4trtxAPRdLkX1-_7N5NeJmj9l0HNWS2eVo9e98vpiOIt2GNT2aOhGewnG1St8XD8zMoMKtLXY_OVQqNbdjeHnl6K3YTzFfXxUny8Ej9ViF2Qnn5FjJ1n-3V5sB47dftulP8vxv-kGK8XfTm-E2EpPvtfAN1MdbP4evGjWd_3x-n5SZq5kUrt0HTyn9JM1aWBZ5p57KFa_mPQMHYK3YoMciO3S3anZxJ8R80mdqB2R9s-jq2Ld_YBhNHOPyL6eCcw3CFzaNuJ2xT89tz1lp27I0Szkqm0Mo3I9RoXwt6ZMtp--EHftv8AOPpXXRoSAAA=) for a quick preview !

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
See this [Demo REPL](https://svelte-5-preview.vercel.app/#H4sIAAAAAAAACu1Y3W7jRBR-laO0UhKRxl3aStR1AttsV0gIVQIkLrYrNLbH8ew6M9bMJGkxvuQlEBIPwFvxBDwC82tPsuluyw03qKpkn5nz830-f20zKEiFxSB-0wwoWuFBPHhZ14PJQD7U-kVscCWxehdszTMtSUTGSS3nd1T9SLKqGZewQDz_3lw9h4KzFQynUSCbWjPDq4MqFwdULj6hcr04pHS9mL4TVsWGlzEqJGTqhoAZvAlCmoTWJrum33oLssIScoIqtrzyryssBFpiZe5YSCTxaHxlfRVrmknCKIiSbb9lOapGqzE0xpTstVbWuLRmp_1lydfY2JLtnkFGs4pk70d4IzuDvd7QHUMMQ_gM9KXHrKyFZKuPmDHnB-0kUfDZExs7pITmsSyJmDVW0upjmdTzxuFtk6i2snQtZQ9l1ozGs7mjIKuYUDS289tvksjem2uP9tgmGk1KjHLMvQMbfZKxHM-Dr5pERgJEAIIknVsxKHk6h4ypNKKYSgGyRBLWAoO1IComhdOdhKYZjU283m66TtOK0OUEEM2dcsaxSoObjTL8iogayazEfDR2KlNnLuXR_K_ffwXjCn4B9eyN2zdBSV1jc_b3H7_96YgycD2Hj8G-CGDLEoNQhdyjhS0nUmIKWyLLgJQLQ4p4oBLdO9Ac1xXKFD5IiCUlUkFiDU3RQxT-B8-Yi9Z77uko1WOFuT8J4GtYHX6L8RECDDnPwH-92GOgB_8oV1uOlLscCFWpou8jSVJSEfkAFXrA_N98uENxJ1GfuTRZIaKTuznCKCtdY0LCtB9Xr6q4Njs4G3041c259bGvhf5Gex8IYqel74OPcda4iFojMhVuZOapdZ6Ulu23ccHRcqWJ09ZndwMb_N2gu3gnv755-ermOxjpGz6UXeVxZzXaO3FjwzRAXKB1ZR11xrtoakR9CAVjci-E17e3P-gQeiJCl0rXM2img82eqCP2eSy7zxv5xPY8h2z3JB-gtjlyNsCSqVrdATLtlQ5GEzlJ2zOWlaTKOab7bPUOLFU7DjxVH3VwmKom0lna6hx2easehXyobFlbNH6SFIzKE0F-xjG8-Ly-d1OuRnmuWIzhvBOlKHu_5GytZgccFS_0jzvJWMW4Ep6ennaTR2rP3keu-qsqzhiWnOROST-eSLxSBxKfKBPrFRUqhoLrX38J1TGcqbDgCxeHQWWxqO1mxXJSEJwPYj2F20m3DAWz5YlLkV9WGjg4GKB1i0uw3yglfG-U9ILBatWrZ1CgSuCrcI3JnRF1-MjM2d9ECsLxwg79ccihvj8a2jwdTlTOKpexcdyOA3Y8Jl0skFVIiNlQt6yhwdkckQKOj00Xmtpc8KnkOl5iOoRmMmgk0TzsiCoNSWHUfGu0TddvC7aJzTUQ6IdxtyQcujxrethtr2ne91VL1dzdo441cunfhbKD0RaXx2jfdjH6TqUxuvMAY9eBwiJSomlmWoirDsYVNTHoXBWsIjkcXV5ePrl0zs7OnIRtMC8qto2hJHmOaV9Rlv2JaxbecVepp3A6veDY76lBXSt5J94JpY_Qx1EURai_xWRZyhhSVuWHS7t33zt_do1ePKlGu83eudZ57xYgR43D4trtxAPRdLkX1-_7N5NeJmj9l0HNWS2eVo9e98vpiOIt2GNT2aOhGewnG1St8XD8zMoMKtLXY_OVQqNbdjeHnl6K3YTzFfXxUny8Ej9ViF2Qnn5FjJ1n-3V5sB47dftulP8vxv-kGK8XfTm-E2EpPvtfAN1MdbP4evGjWd_3x-n5SZq5kUrt0HTyn9JM1aWBZ5p57KFa_mPQMHYK3YoMciO3S3anZxJ8R80mdqB2R9s-jq2Ld_YBhNHOPyL6eCcw3CFzaNuJ2xT89tz1lp27I0Szkqm0Mo3I9RoXwt6ZMtp--EHftv8AOPpXXRoSAAA=)

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
