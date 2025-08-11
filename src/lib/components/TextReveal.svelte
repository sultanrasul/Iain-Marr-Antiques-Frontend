<script lang="ts">
    import { cn } from "$lib/utils";
    import { useElementScroll } from "svelte-motion";
    import Word from "./Word.svelte";
    let className: any = "";
    export { className as class };
    export let text = "Hello Everyone Svelte is Fun";
    let words = text.split(" ");
    let val = useElementScroll();
    let icode = val.scrollYProgress;
  </script>
  
  <div bind:this={val.ref} class="scroller ">
    <div class={cn("relative z-10 inner ", className)}>
      <div
        class="sticky top-0 mx-auto flex h-[40%] max-w-4xl items-center bg-transparent px-[1rem] py-[5rem]"
      >
      max-w-2xl mb-4 font-light text-lg md:text-xl lg:text-2xl dark:text-gray-400
        <p
          class="flex flex-wrap p-5  text-lg  font-light text-black/20 dark:text-white/20 md:p-8 md:text-xl lg:p-10 lg:text-2xl xl:text-5xl "
        >
          {#each words as item, i}
            <Word progress={icode} range={[i, i + 1]} wordsLen={words.length}>
              {item}
            </Word>
          {/each}
        </p>
      </div>
    </div>
  </div>
  
  <style>
    .scroller {
      position: absolute;
      overflow: scroll;
      display: inline-block;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .inner {
      display: inline-block;
      width: 100%;
      height: 200vh;
    }
  </style>
  