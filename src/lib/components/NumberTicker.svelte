<script lang="ts">
  import { cubicOut } from "svelte/easing";
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";
  import { cn } from "$lib/utils";

  export let value = 100.00; // Target value
  export let initial = 3750.99;
  export let duration = 3000;

  const targetInt = Math.floor(value);
  const decimalValue = +(value % 1).toFixed(2); // Number like 0.75 or 0.00
  const targetDecimal = decimalValue !== 0 ? decimalValue.toFixed(2).substring(1) : ''; // ".75" or ''

  let animatedInt = tweened(Math.floor(initial), {
    duration,
    easing: cubicOut
  });

  let className: any = "";
  export { className as class };

  onMount(() => {
    animatedInt.set(targetInt);
  });
</script>

<div
  class={cn("text-4xl font-bold text-[#C09A5B]", className)}
  {...$$restProps}
>
  {#if value === 0 || value === 0.0}
    <span class="mr-20">£</span>
  {:else}
    <span>
      £{Math.floor($animatedInt)}{targetDecimal}
    </span>
  {/if}
</div>
