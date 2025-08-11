
  
  <!-- Sidebar -->
  <div id="hs-sidebar-offcanvas" 
  class="hs-overlay w-full sm:w-[40%]
         hs-overlay-open:translate-x-0
         hs-overlay-backdrop-open:bg-blue-950/90
         translate-x-full transition-all duration-300 transform
         h-full
         hidden
         fixed top-0 end-0 bottom-0 z-[60]
         bg-white border-s border-gray-200 text-gray-600" 
  role="dialog" 
  tabindex="-1" 
  aria-label="Sidebar">

  <div class="relative flex flex-col h-full max-h-full">
  <!-- Header -->
  <header class="p-4 flex justify-between items-center border-b border-gray-200">
    <div class="flex items-center gap-2">
      <span class="font-semibold">GBP</span>
      <span class="text-gray-500">|</span>
      <span class="text-gray-600">ENGLISH</span>
    </div>
    <!-- svelte-ignore a11y_consider_explicit_label -->

    <!-- Close Button -->
    <button type="button" 
        class="ml-2 sm:ml-4 p-1 sm:p-2 rounded-full hover:bg-[#C09A5B]/20 transition-all duration-300 group"
        data-hs-overlay="#hs-sidebar-offcanvas">
      <svg class="w-7 h-7  text-[#C09A5B] group-hover:text-[#C09A5B]/80 group-hover:rotate-90 transition-all" 
          viewBox="0 0 24 24" fill="none" stroke="currentColor" 
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
      </svg>
    </button>

  </header>

  <!-- Body -->
  <nav class="h-full overflow-y-auto p-4 space-y-6">
    <!-- Locations Section -->

    <!-- Our Company -->
    <div class="space-y-2" >
      <h3 class="text-sm font-semibold text-gray-500 uppercase">Our Company</h3>
      <!-- <ul class="space-y-1 cursor-pointer" data-sveltekit-reload> This is the fix to the issue of combinging two pages -->
      <ul class="space-y-1 cursor-pointer">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li><a data-hs-overlay="#hs-sidebar-offcanvas" href="/" class="block p-2 text-gray-700 hover:bg-[#C09A5B]/60 rounded">View Our Apartments</a></li>
        <li><a data-hs-overlay="#hs-sidebar-offcanvas" href="/aparthotel" class="block p-2 text-gray-700 hover:bg-[#C09A5B]/60 rounded">What is an aparthotel?</a></li>
        <li><a data-hs-overlay="#hs-sidebar-offcanvas" href="/gallery" class="block p-2 text-gray-700 hover:bg-[#C09A5B]/60 rounded">Gallery</a></li>
        <li><a data-hs-overlay="#hs-sidebar-offcanvas" href="/reviews" class="block p-2 text-gray-700 hover:bg-[#C09A5B]/60 rounded">Reviews </a></li>
        <!-- <li><a on:click={() => { window.location.href = "/"; }} class="block p-2 text-gray-700 hover:bg-[#C09A5B]/60 rounded">About Us</a></li> -->
        <!-- <li><a href="#" class="block p-2 text-gray-700 hover:bg-[#tygyC09A5B]/60 rounded">Press & Media</a></li> -->
      </ul>
    </div>
    
    <!-- Customer Support Section -->
    <div class="space-y-2">
      <h3 class="text-sm font-semibold text-gray-500 uppercase">Customer Support</h3>
      <ul class="space-y-1 cursor-pointer">
        <li><a data-hs-overlay="#hs-sidebar-offcanvas" href="/contact" class="block p-2 text-gray-700 hover:bg-[#C09A5B]/60 rounded">Contact Us</a></li>
        <li><a data-hs-overlay="#hs-sidebar-offcanvas" href="/details" class="block p-2 text-gray-700 hover:bg-[#C09A5B]/60 rounded">Manage Booking</a></li>
        <li><a data-hs-overlay="#hs-sidebar-offcanvas" href = "/terms" class="block p-2 text-gray-700 hover:bg-[#C09A5B]/60 rounded">Terms and Conditions</a></li>
        <!-- <li><a data-hs-overlay="#hs-sidebar-offcanvas" href = "/faq"   class="block p-2 text-gray-700 hover:bg-[#C09A5B]/60 rounded">FAQ</a></li> -->
      </ul>
    </div>




  </nav>
  </div>

</div>
  <!-- End Sidebar -->