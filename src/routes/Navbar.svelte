<script lang="ts">
	import { cn } from '$lib/utils';
	import { AlignJustify, Menu, XIcon } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
  import BorderBeam from '$lib/components/BorderBeam.svelte';
  import DropdownMenu from '$lib/components/DropdownMenu.svelte';
  import { onMount } from 'svelte';
  import Drawer from './Drawer.svelte';
  export let fixed = false;

  let scrolled = false;
  let screenWidth: number;

  function scrollToElementWithOffset(id: string) {
        const element = document.getElementById(id);
        const yOffset = -100; // Adjust this value as needed
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });
    }

  // Update the screen width on resize
  const updateWidth = () => {
      screenWidth = window.innerWidth;
  };

  onMount(() => {
      updateWidth(); // Set initial width
      window.addEventListener('resize', updateWidth);

      // Cleanup on component destruction
      return () => {
          window.removeEventListener('resize', updateWidth);
      };
  });

	// Event listener to track scroll position
	// function handleScroll() {
	// 	scrolled = window.scrollY > 0;
  //   console.log(scrolled);
	// }



</script>


<!-- <svelte:window on:scroll={handleScroll} /> -->
<!-- {fixed ? 'fixed' : ''} -->
<!-- <svelte:window bind:innerWidth /> -->

<!-- <header class="fixed top-0 left-0 z-50 w-full bg-gray-800/0 transition-transform
{scrolled ? 'backdrop-blur-lg border-b shadow-xl' : 'backdrop-filter-none'}"> -->
<!-- <Drawer/> -->

<header class=" left-0 top-0 z-50 w-full animate-fade-in opacity-100 backdrop-blur-[3px] border-b shadow-xl">
  <div class="pl-12 pr-12 flex h-[66px] lg:h-[80px] items-center justify-between m-auto">
    <!-- Logo -->
    <div class="flex-shrink-0">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
       <a href="/">
        <img src="/name.svg" 
             class="h-auto w-[150px] md:w-[200px] max-w-full cursor-pointer" 
             alt="Logo"
             style="object-fit: contain"
  
             >
      </a>
    </div>

    <!-- Navigation Links -->
    <nav class="ml-auto flex h-full items-center space-x-6 cursor-pointer" 
         aria-haspopup="dialog" 
         aria-expanded="false" 
         aria-controls="hs-sidebar-offcanvas" 
         aria-label="Toggle navigation" 
         data-hs-overlay="#hs-sidebar-offcanvas">
      <Menu size="30px"/>
    </nav>
  </div>
</header>

