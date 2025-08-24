<script>
  import { FolderSync, Printer, PlusCircle, Settings, Wifi, WifiOff, Power, RefreshCw } from "lucide-svelte";
  import { onMount } from "svelte";
  import { BACKEND_URL } from "../conf";


  export let searchTerm = "";
  export let fetchProducts;
  export let showPrintModal;
  export let selectedProducts;
  export let showAddProductModal;
  export let handleSort;
  export let sortConfig;
  export let sortOptions = [];

  // New state variables
  let showSettingsModal = false;
  export let printerConnected;
  let isCheckingPrinter = false;

  // Reconnect Printer
  async function reconnectPrinter() {
    isCheckingPrinter = true;
    try {
      const response = await fetch(`${BACKEND_URL}/reconnect_printer`);
      if (response.ok) {
        const data = await response.json();
        printerConnected = data.connected;
      } else {
        printerConnected = false;
      }
    } catch (error) {
      console.error("Failed to check printer status:", error);
      printerConnected = false;
    } finally {
      isCheckingPrinter = false;
    }
  }

  // Restart Raspberry Pi
  async function restartPi() {
    try {
      const response = await fetch(`${BACKEND_URL}/restart`, { method: "POST" });
      if (response.ok) {
        alert("Raspberry Pi is restarting...");
      } else {
        alert("Failed to restart Raspberry Pi");
      }
    } catch (error) {
      console.error("Failed to restart Pi:", error);
      alert("Failed to restart Raspberry Pi");
    }
  }

  // Shutdown Raspberry Pi
  async function shutdownPi() {
    if (confirm("Are you sure you want to shutdown the Raspberry Pi?")) {
      try {
        const response = await fetch(`${BACKEND_URL}/shutdown`, { method: "POST" });
        if (response.ok) {
          alert("Raspberry Pi is shutting down...");
        } else {
          alert("Failed to shutdown Raspberry Pi");
        }
      } catch (error) {
        console.error("Failed to shutdown Pi:", error);
        alert("Failed to shutdown Raspberry Pi");
      }
    }
  }

</script>
<div class="bg-white rounded-xl shadow-lg p-4 mb-2" id="searchBar">
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
  <div class="flex flex-wrap gap-2 mt-2 justify-between items-center">
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
    <div class="flex flex-wrap gap-2 items-center">
      <!-- Printer Status Indicator -->
      <div class="flex items-center mr-2" title="{printerConnected ? 'Printer connected' : 'Printer disconnected'}">
        {#if isCheckingPrinter}
          <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
        {:else if printerConnected}
          <Wifi size={20} class="text-green-500" />
        {:else}
          <WifiOff size={20} class="text-red-500" />
        {/if}
      </div>

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

      <!-- Add Stock Button -->
      <button 
        on:click={() => {showAddProductModal = true;}}
        class="px-4 py-2.5 rounded-lg font-medium flex items-center bg-green-600/80 text-white hover:bg-green-600 transition-colors"
        title="Add stock"
      >  
        <PlusCircle size={30} class=""/>
      </button>

      <!-- Settings Button -->
      <button 
        on:click={() => showSettingsModal = true}
        class="px-4 py-2.5 rounded-lg font-medium flex items-center bg-gray-600/80 text-white hover:bg-gray-600 transition-colors"
        title="Settings"
      >  
        <Settings size={30} class=""/>
      </button>
    </div>
  </div>
</div>

<!-- Settings Modal -->
{#if showSettingsModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
      <!-- Modal Header -->
      <div class="p-6 border-b flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-800">System Settings</h2>
        <button
          on:click={() => showSettingsModal = false}
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Modal Content -->
      <div class="p-6 space-y-4">
        <!-- Printer Status -->
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-black">
          <div class="flex items-center">
            {#if isCheckingPrinter}
              <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            {:else if printerConnected}
              <Wifi size={20} class="text-green-500 mr-2" />
            {:else}
              <WifiOff size={20} class="text-red-500 mr-2" />
            {/if}
            <span>Printer Status:</span>
          </div>
          <span class="font-medium">
            {#if isCheckingPrinter}
              Checking...
            {:else if printerConnected}
              Connected
            {:else}
              Disconnected
            {/if}
          </span>
        </div>
        
        <!-- Reconnect Printer Button -->
        <button 
          on:click={reconnectPrinter}
          disabled={isCheckingPrinter}
          class="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={18} class="mr-2 {isCheckingPrinter ? 'animate-spin ' : ''}" />
          {isCheckingPrinter ? 'Reconnecting...' : 'Reconnect Printer'}
        </button>
        
        <!-- Restart Pi Button -->
        <button 
          on:click={restartPi}
          class="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          <Power size={18} class="mr-2" />
          Restart Raspberry Pi
        </button>
        
        <!-- Shutdown Pi Button -->
        <button 
          on:click={shutdownPi}
          class="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Power size={18} class="mr-2" />
          Shutdown Raspberry Pi
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
</style>