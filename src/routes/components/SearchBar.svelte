<script lang="ts">
  import { FolderSync, Printer, PlusCircle, Settings, Wifi, WifiOff, Power, RefreshCw } from "lucide-svelte";

  import { BACKEND_URL } from "../conf";
  import type { Product } from "@/models/product";
  import type { PrintRequest } from "@/types";

  // ---------- props ----------

  export let searchTerm: string = "";

  export let fetchProducts: () => Promise<void>;

  export let showPrintModal: boolean;
  export let showAddProductModal: boolean;
  export let showRecallModal: boolean;

  export let selectedProducts: Product[];

  export let handleSort: (key: keyof Product) => void;

  export let printerConnected: boolean;

  export let suspendedPrintRequests: PrintRequest[];


  export let sortConfig: { key: keyof Product; direction: "asc" | "desc" };

  export let sortOptions: { id: keyof Product; name: string }[] = [];

  // ---------- local state ----------

  let showSettingsModal = false;
  let isCheckingPrinter = false;

  // ---------- printer ----------

  async function reconnectPrinter(): Promise<void> {
    isCheckingPrinter = true;
    try {
      const response = await fetch(`${BACKEND_URL}/system/reconnect-printer`);
      if (!response.ok) throw new Error("Failed");

      const data: { connected: boolean } = await response.json();
      printerConnected = data.connected;
    } catch (error) {
      console.error("Failed to check printer status:", error);
      printerConnected = false;
    } finally {
      isCheckingPrinter = false;
    }
  }

  // ---------- system ----------

  async function restartPi(): Promise<void> {
    if (!confirm("Are you sure you want to restart the Raspberry Pi?")) return;

    try {
      const response = await fetch(`${BACKEND_URL}/system/restart`);

      alert(
        response.ok
          ? "Raspberry Pi is restarting..."
          : "Failed to restart Raspberry Pi"
      );
    } catch (error) {
      console.error("Failed to restart Pi:", error);
      alert("Failed to restart Raspberry Pi");
    }
  }

  async function shutdownPi(): Promise<void> {
    if (!confirm("Are you sure you want to shutdown the Raspberry Pi?")) return;

    try {
      const response = await fetch(`${BACKEND_URL}/system/shutdown`, {
        method: "POST"
      });

      alert(
        response.ok
          ? "Raspberry Pi is shutting down..."
          : "Failed to shutdown Raspberry Pi"
      );
    } catch (error) {
      console.error("Failed to shutdown Pi:", error);
      alert("Failed to shutdown Raspberry Pi");
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

    <div class="flex items-center gap-3 flex-wrap">
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

      <!-- Primary Sale Actions -->
      <div class="flex items-center gap-2">
        <button 
          on:click={() => showPrintModal = true}
          disabled={selectedProducts.length === 0}
          class="flex items-center px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
          <Printer size={20} class="mr-2"/>
          Print ({selectedProducts.length})
        </button>
        
        <button 
          on:click={() => showRecallModal = true}
          disabled={suspendedPrintRequests.length === 0}
          class="px-4 py-2.5 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Recall
        </button>
      </div>

      <!-- Divider -->
      <div class="hidden lg:block w-px h-8 bg-gray-300"></div>

      <!-- System Controls (icon only) -->
      <div class="flex items-center gap-2">

        <button 
          on:click={fetchProducts}
          class="p-2 bg-green-600/80 text-white rounded-lg hover:bg-green-600"
          title="Refresh stock"
        >
          <FolderSync size={20}/>
        </button>

        <button 
          on:click={() => showAddProductModal = true}
          class="p-2 bg-green-600/80 text-white rounded-lg hover:bg-green-600"
          title="Add stock"
        >
          <PlusCircle size={20}/>
        </button>

        <button 
          on:click={() => showSettingsModal = true}
          class="p-2 bg-gray-600/80 text-white rounded-lg hover:bg-gray-600"
          title="Settings"
        >
          <Settings size={20}/>
        </button>
      </div>

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