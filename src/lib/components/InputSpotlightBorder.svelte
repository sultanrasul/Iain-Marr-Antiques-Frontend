<script lang="ts">
    import { Motion, useMotionTemplate, useMotionValue } from "svelte-motion";
  
    let divRef: HTMLInputElement | HTMLTextAreaElement;
    let isFocused = false;
    let positionX = useMotionValue(0);
    let positionY = useMotionValue(0);
    let opacity = 0; // Start with 0 opacity
    export let textArea = false;
    export let value: string = ""; // Export the value prop for binding
  
    export let placeholder = "Your Name";
    let handleMouseMove = (e: MouseEvent) => {
      const rect = divRef.getBoundingClientRect();
      positionX.set(e.clientX - rect.left);
      positionY.set(e.clientY - rect.top);
    };
    let handleFocus = () => {
      isFocused = true;
      opacity = 1;
    };
    let handleBlur = () => {
      isFocused = false;
      opacity = 0;
    };
    let handleMouseEnter = () => {
      if (!isFocused) opacity = 1;
    };
    let handleMouseLeave = () => {
      if (!isFocused) opacity = 0;
    };
    let shineBorder = useMotionTemplate`radial-gradient(30% 30px at ${positionX}px ${positionY}px, black 45%, transparent)`;
  </script>

  {#if !textArea}
  <div class="relative">
    <input
      bind:this={divRef}
      on:mousemove={handleMouseMove}
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      autocomplete="off"
      placeholder={placeholder}
      type="text"
      name="name"
      bind:value
      class="h-12 w-full cursor-default rounded-md border border-gray-400 bg-white p-3.5 text-black transition-colors duration-500 placeholder:select-none placeholder:text-gray-400 focus:border-[#C09A5B] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
      style="outline: none !important; box-shadow: none !important;"
    />
  
    <!-- Disabled input (unchanged) -->
    <input
      type="text"
      disabled
      style="border: 3px solid #C09A5B; opacity:{opacity}; mask-image: {$shineBorder}; outline: none !important; box-shadow: none !important;"
      aria-hidden="true"
      class="pointer-events-none absolute left-0 top-0 z-10 h-12 w-full cursor-default rounded-md border border-[#C09A5B] bg-transparent p-3.5 opacity-0 transition-opacity duration-500 placeholder:select-none"
    />
  </div>
{:else}
  <div class="relative">
    <textarea
      bind:this={divRef}
      on:mousemove={handleMouseMove}
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      placeholder={placeholder}
      bind:value
      style="outline: none !important; box-shadow: none !important;"
      class="h-24 w-full cursor-default rounded-md border border-gray-800 bg-white p-3.5 text-black transition-colors duration-500 placeholder:select-none placeholder:text-gray-400 focus:border-[#C09A5B] focus:outline-none resize-none"
    ></textarea>

    <textarea
      disabled
      style="border: 3px solid #C09A5B; opacity:{opacity}; mask-image: {$shineBorder};"
      aria-hidden="true"
      class="pointer-events-none absolute left-0 top-0 z-10 h-24 w-full cursor-default rounded-md border border-[#C09A5B
      ] bg-transparent p-3.5 opacity-0 transition-opacity duration-500 placeholder:select-none resize-none"
    ></textarea>
  </div>
{/if}

