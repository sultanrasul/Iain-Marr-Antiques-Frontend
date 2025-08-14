<script>
  import { FolderSync, Printer } from "lucide-svelte";

    export let searchTerm = "";
    export let fetchProducts; // New function you can implement
    export let showPrintModal;
    export let activeTab;
    export let selectedProducts;
    
    export let products;
    export let sortConfig;
    export let filteredProducts;
    export let openPrintModal;

</script>

<!-- Controls -->
<div class="bg-white rounded-xl shadow-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
    <!-- Search -->
    <div class="relative w-full">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <input 
            type="text" 
            class="text-black w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Search by name, SKU, IM SKU, seller or location..." 
            bind:value={searchTerm}
        />
    </div>

    
    <!-- Print Button -->
    <button 
        on:click={() => { showPrintModal = true}}
        disabled={selectedProducts.length === 0}
        class="flex items-center min-w-[220px] w-full md:w-auto px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
        <Printer size={30} class="mr-2"/>
        Print Selected ({selectedProducts.length})
    </button>

    <!-- Refresh Stock Button -->
    <button 
        on:click={fetchProducts}
        class="px-4 py-2.5 rounded-lg font-medium flex items-center bg-green-600/80 text-white hover:bg-green-600 transition-colors"
        title="Refresh stock"
    >  
        <FolderSync size={30} class="pr-2"/>
        <!-- <svg class="w-5 h-5 mr-2 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582M20 20v-5h-.581M4 20a9 9 0 0116-16M20 4a9 9 0 00-16 16"></path>
        </svg> -->
        Refresh 
    </button>
</div>
