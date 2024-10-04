# Svelte 4 Backward Compatibility for Svelte 5

**svelte4-bc** is a plugin that improves Svelte 4 backwards compatibility in Svelte 5

## Why ?

**Svelte 5** is already backwards compatible with the **Svelte 4** syntax (*slots, on:events* directives).

But when a component is migrated to the new syntax (*snippet/handlers*), all the calling codes that use this component should also be migrated in order to replace *slots/on:events* by *snippets/handlers*.
This can be problematic on large projects.

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

## How to use ?

> *TODO*

## How it works ?

> *TODO*
