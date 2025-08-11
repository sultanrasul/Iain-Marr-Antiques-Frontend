<script lang="ts">
  import { cn } from "$lib/utils";
  import { Motion } from "svelte-motion";
  import { inview } from 'svelte-inview';

  export let words = 'Pull Up';
  export let inViewMargin = '-20px';
  export let once = true;
  export let delay = 0;
  export let duration = 0.25;
  
  export let wrapperFramerProps = {
      hidden: { opacity: 0 },
      show: {
          opacity: 1,
          transition: {
              delayChildren: delay,
              staggerChildren: duration,
          },
      },
  };
  
  export let framerProps = {
      hidden: { y: 20, opacity: 0 },
      show: { y: 0, opacity: 1 },
  };

  let className: any = "";
  export { className as class };

  let wordSplit = words.split(" ");
  let isInView = 'hidden';
</script>

<Motion
  variants={wrapperFramerProps}
  initial="hidden"
  animate={isInView}
  let:motion
>
  <h1
      use:inview={{ rootMargin: inViewMargin, unobserveOnEnter: once }}
      on:inview_change={({ detail }) => {
          isInView = detail.inView ? 'show' : 'hidden';
      }}
      class={cn(
          "font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.01em] drop-shadow-sm",
          className
      )}
      use:motion
  >
      {#each wordSplit as word, i}
          <Motion variants={framerProps} let:motion>
              <span class="inline-block pr-[8px]" use:motion>
                  {#if word === ""}
                      <span>&nbsp;</span>
                  {:else}
                      {word}
                  {/if}
              </span>
          </Motion>
      {/each}
  </h1>
</Motion>
