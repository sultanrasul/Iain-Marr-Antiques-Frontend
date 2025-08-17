<script>
  import { FolderSync, Printer, PlusCircle } from "lucide-svelte";

  export let searchTerm = "";
  export let fetchProducts;
  export let showPrintModal;
  export let selectedProducts;
  export let showAddProductModal;
  export let handleSort;
  export let sortConfig;
  export let sortOptions = [];

</script>

<div class="bg-white rounded-xl shadow-lg p-4 mb-2">
  <!-- Search Bar -->
  <div class="relative mb-4">
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input 
      type="text" 
      class="text-black w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
      placeholder="Search by name, SKU, seller or location..." 
      bind:value={searchTerm}
    />
  </div>

  <!-- All Buttons Row -->
  <div class="flex flex-wrap gap-2 mt-2">
    <!-- Sort Buttons -->
    <div class="flex flex-wrap gap-2">
      {#each sortOptions as option}
        <button
          class={`px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center
                  ${sortConfig.key === option.id ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
          on:click={() => handleSort(option.id)}
        >
          <span>{option.name}</span>
          {#if sortConfig.key === option.id}
            <svg class={`ml-1.5 w-4 h-4 ${sortConfig.direction === 'asc' ? '' : 'transform rotate-180'}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
            </svg>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-2 ml-auto ">
      <!-- Print Button -->
      
        <button 
            on:click={() => { showPrintModal = true}}
            disabled={selectedProducts.length === 0}
            class="flex items-center min-w-[220px] px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
            <Printer size={30} class="mr-2"/>
            Print Selected ({selectedProducts.length})
        </button>

        <!-- Refresh Button -->
        <button 
            on:click={fetchProducts}
            class="px-4 py-2.5 rounded-lg font-medium flex items-center bg-green-600/80 text-white hover:bg-green-600 transition-colors"
            title="Refresh stock"
        >  
            <FolderSync size={30} class=""/>


        </button>
    </div>


    <!-- Add Stock Button -->
    <button 
        on:click={() => {showAddProductModal = true;}}
        class="px-4 py-2.5 rounded-lg font-medium flex items-center bg-green-600/80 text-white hover:bg-green-600 transition-colors"
        title="Add stock"
    >  
        <PlusCircle size={30} class=""/>


    </button>


    </div>
  </div>


<style>
</style>