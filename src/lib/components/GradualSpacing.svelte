<script lang="ts">
  import { cn } from "$lib/utils";
  import { AnimatePresence, Motion } from "svelte-motion";
  import { inview } from 'svelte-inview';

  let className: any = "Gradual Spacing";
  export { className as class };

  export let words = "Gradual Spacing";
  export let duration = 0.5;
  export let delayMultiple = 0.04;
  export let inViewMargin = '-20px';
  export let once = true;
  
  export let framerProps = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // Reactive declaration to update when words change
  $: wordsspilit = words.split("");
  let isInView = 'hidden';
</script>

<div 
  class="flex justify-left"
  use:inview={{ rootMargin: inViewMargin, unobserveOnEnter: once }}
  on:inview_change={({ detail }) => {
    isInView = detail.inView ? 'visible' : 'hidden';
  }}
>
  <AnimatePresence let:item list={[{ key: wordsspilit }]}>
    {#each wordsspilit as char, i}
      <Motion
        initial="hidden"
        animate={isInView}
        exit="hidden"
        variants={framerProps}
        transition={{
          duration: duration,
          delay: i * delayMultiple,
        }}
        let:motion
      >
        <span use:motion class={cn("drop-shadow-sm", className)}>
          {#if char === " "}
            <span>&nbsp;</span>
          {:else}
            {char}
          {/if}
        </span>
      </Motion>
    {/each}
  </AnimatePresence>
</div>