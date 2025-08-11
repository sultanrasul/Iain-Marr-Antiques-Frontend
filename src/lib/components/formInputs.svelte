<script>
// @ts-nocheck

    export let children = 0;
    export let adults = 1;
    import { Baby, UserRound } from "lucide-svelte";

    function incrementAdults(){
        adults +=1;
    }

    function decrementAdults(){
        if (adults > 1){
            adults-=1;
        }
    }

    function incrementChildren(){
        children +=1;
    }

    function decrementChildren(){
        if (children > 0){
            children-=1;
        }
    }
    
</script>


<form class="max-w-xs mx-auto">

      <!-- NUMBER OF ADULTS -->
      <label for="nights-input" class="sr-only">Choose number of nights:</label>
      <div class="relative flex items-center mb-2">
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button on:click={decrementAdults}
            type="button" id="decrement-button" data-input-counter-decrement="nights-input" class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 ">
          <svg class="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
          </svg>
        </button>
        <input type="text" id="nights-input" data-input-counter data-input-counter-min="1" data-input-counter-max="30" class="bg-gray-50 border-x-0 border-gray-300 h-11 font-medium text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full pb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" bind:value={adults} required />
        <div class="absolute bottom-1 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center text-xs text-gray-400 space-x-1 rtl:space-x-reverse">
            <UserRound size={"20px"}/>
          <span>Adults</span>
        </div>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button on:click={incrementAdults} type="button" id="increment-button" data-input-counter-increment="nights-input" class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 ">
          <svg class="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
          </svg>
        </button>
      </div>

      <!-- NUMBER OF CHILDREN -->
      <div class="relative flex items-center">
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button on:click={decrementChildren} type="button" id="decrement-button" data-input-counter-decrement="guests-input" class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 ">
        <svg class="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
        </svg>
      </button>
        <input type="text" id="guests-input" data-input-counter data-input-counter-min="1" data-input-counter-max="5" class="bg-gray-50 border-x-0 border-gray-300 h-11 font-medium text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full pb-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" bind:value={children} required />
        <div class="absolute bottom-1 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center text-xs text-gray-400 space-x-1 rtl:space-x-reverse">
            <Baby size={"20px"}/>
            <span>Children</span>
        </div>
      <!-- svelte-ignore a11y_consider_explicit_label -->
        <button on:click={incrementChildren} type="button" id="increment-button" data-input-counter-increment="guests-input" class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 ">
            <svg class="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
            </svg>
        </button>
    </div>
  </form>