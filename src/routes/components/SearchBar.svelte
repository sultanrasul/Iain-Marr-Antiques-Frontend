<script lang="ts">
  import { FolderSync, Printer, PlusCircle, Settings, Wifi, WifiOff, Power, RefreshCw, Database, FileText, Download, Upload, Cloud, Loader2, Check, AlertCircle, Edit, X } from "lucide-svelte";

  import { BACKEND_URL } from "../conf";
  import type { Product } from "@/models/product";
  import type { PrintRequest } from "@/types";
  import type { Settings as SettingsType } from "@/models/settings";

  // ---------- props ----------

  export let searchTerm: string = "";

  export let fetchProducts: () => Promise<void>;

  export let settings: SettingsType;

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

    // Sheet ID editing state
  let isEditingSheetId = false;
  let isSavingSheetId = false;
  let editableSheetId = '';

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

  // let databaseFileName: string = 'pos_database.db';
  // let googleSheetId: string = '';

  let syncResults: [[number, string][], [number, string][]];
  let isImportingData: boolean = false;
  let isSyncingDataToGoogleSheets: boolean = false;

  let selectedFile = null;
  let newFileName = "";

  // Triggered when the user selects a file
  async function uploadDatabase(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    // Optional: include a new filename
    if (newFileName.trim()) {
      formData.append("new_name", newFileName.trim());
    }

    try {
      const response = await fetch(`${BACKEND_URL}/system/upload-database`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed");

      const data = await response.json();
      alert(`Database uploaded successfully: ${data.DATABASE_PATH}`);

    } catch (err) {
      console.error(err);
      alert("An error occurred during upload.");
    }
  }

  async function importGoogleSheetData(): Promise<void> {
    isImportingData = true;
    try {
      const response = await fetch(`${BACKEND_URL}/system/import-google-sheets-data`);
      if (!response.ok) throw new Error("Failed");

      syncResults = await response.json();

    } catch (error) {
      console.error("Failed to check printer status:", error);
      printerConnected = false;
    } finally {
      isImportingData = false;
    }
  }

  async function syncDataToGoogleSheets(): Promise<void> {
    isSyncingDataToGoogleSheets = true;
    try {
      const response = await fetch(`${BACKEND_URL}/system/sync-data-to-google-sheets`);
      if (!response.ok) throw new Error("Failed");

      syncResults = await response.json();

    } catch (error) {
      console.error("Failed to check printer status:", error);
      printerConnected = false;
    } finally {
      isSyncingDataToGoogleSheets = false;
    }
  }


  // Function to save the new sheet ID
  async function saveSheetId() {
    if (!editableSheetId || editableSheetId.trim() === '') {
      // Optionally show error
      alert('Please enter a valid Google Sheets ID');
      return;
    }
    
    try {
      isSavingSheetId = true;
      
      // Make fetch request to update the sheet ID
      const response = await fetch(`${BACKEND_URL}/system/update-sheets-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_id: editableSheetId.trim() }) // Changed from sheetId to new_id
      });
      
      if (!response.ok) {
        throw new Error('Failed to update Sheet ID');
      }
      
      const result = await response.json();
      
      // Update the settings object
      settings.GOOGLE_SHEETS_ID = editableSheetId.trim();
      
      // Exit edit mode
      isEditingSheetId = false;
      
      // Optional: Show success message
      console.log('Sheet ID updated successfully');
      
    } catch (error) {
      console.error('Error updating sheet ID:', error);
      alert('Failed to update Google Sheets ID. Please try again.');
    } finally {
      isSavingSheetId = false;
    }
  }

  // Function to cancel editing
  function cancelEditSheetId() {
    isEditingSheetId = false;
    editableSheetId = '';
  }

 // Function to start editing (populate editable with current value)
  function startEditSheetId() {
    editableSheetId = settings.GOOGLE_SHEETS_ID || '';
    isEditingSheetId = true;
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
        on:click={() => showRecallModal = true}
        disabled={suspendedPrintRequests.length === 0}
        class="px-4 py-2.5 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
        Recall ({suspendedPrintRequests.length})
      </button>
      
      <button 
        on:click={() => showPrintModal = true}
        disabled={selectedProducts.length === 0}
        class="flex items-center px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
        <Printer size={20} class="mr-2"/>
        Print ({selectedProducts.length})
      </button>
      </div>

      <!-- Divider -->
      <div class="w-px h-8 bg-gray-300"></div>

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
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-800">System Settings</h2>
        <button
          on:click={() => showSettingsModal = false}
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Modal Content -->
      <div class="p-6 space-y-6">
        <!-- Printer Section -->
        <div class="bg-gray-50 rounded-xl p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Printer class="w-5 h-5" />
            Printer Settings
          </h3>
          <div class="space-y-4">
            <!-- Printer Status -->
            <div class="text-black flex items-center justify-between p-3 bg-white rounded-lg">
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
              <RefreshCw size={18} class="mr-2 {isCheckingPrinter ? 'animate-spin' : ''}" />
              {isCheckingPrinter ? 'Reconnecting...' : 'Reconnect Printer'}
            </button>

            <!-- Pi Actions Row -->
            <div class="grid grid-cols-2 gap-3">
              <button
                on:click={restartPi}
                class="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Power size={18} class="mr-2" />
                Restart Pi
              </button>
              <button
                on:click={shutdownPi}
                class="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Power size={18} class="mr-2" />
                Shutdown Pi
              </button>
            </div>
          </div>
        </div>

        <!-- Database Section -->
        <div class="bg-gray-50 rounded-xl p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Database class="w-5 h-5" />
            Database Management
          </h3>
          <div class="space-y-4">
            <!-- File info and actions -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-lg">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <FileText class="w-4 h-4" />
                <span class="font-mono">{settings.DATABASE_PATH || 'pos_database.db'}</span>
              </div>
              <div class="flex gap-2">
                <a
                  href={`${BACKEND_URL}/system/download-database`}
                  class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Download class="w-4 h-4" />
                  Download
              </a>
                <label class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                  <Upload class="w-4 h-4" />
                  Upload
                  <input type="file" accept=".db,.sqlite" class="hidden" on:change={uploadDatabase} />
                </label>
              </div>
            </div>
            <p class="text-xs text-gray-500">Upload a new database file to replace the current one. Download the current database for backup.</p>
          </div>
        </div>

        <!-- Google Sheets Section -->
        <div class="bg-gray-50 rounded-xl p-5">
          <!-- Simpler version with inline editing -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium text-gray-700">Sheet ID</label>
              {#if !isEditingSheetId}
              <button
                on:click={startEditSheetId}
                class="text-black flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Edit product"
              >
                <Edit class="w-4 h-4" />
                <span>Edit</span>
              </button>
              {:else}
                <div class="flex gap-1">
                <button on:click={saveSheetId} disabled={isSavingSheetId} class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {#if isSavingSheetId}
                        <Loader2 class="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                    {:else}
                        <Check class="w-4 h-4" />
                        <span>Save</span>
                    {/if}
                </button>
                  <span class="text-gray-300">|</span>
                  <button
                    on:click={cancelEditSheetId}
                    class="text-black flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Cancel editing"
                  >
                    <X class="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              {/if}
            </div>
            
            {#if isEditingSheetId}
              <input
                type="text"
                bind:value={editableSheetId}
                placeholder="1ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                class="text-black w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autofocus
              />
            {:else}
              <input
                type="text"
                readonly
                value={settings.GOOGLE_SHEETS_ID || 'Not configured'}
                class="text-black w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm cursor-default font-mono"
              />
            {/if}
            <p class="text-xs text-gray-500 mt-1">The ID from your Google Sheets URL (the long string between /d/ and /edit).</p>
          </div>
        </div>
        <!-- Sync Data to Google Sheets -->
        <button
          on:click={syncDataToGoogleSheets}
          disabled={isSyncingDataToGoogleSheets}
          class="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {#if isSyncingDataToGoogleSheets}
            <Loader2 class="w-4 h-4 mr-2 animate-spin" />
            Importing...
          {:else}
            <RefreshCw class="w-4 h-4 mr-2" />
            Sync Data to Google Sheets
          {/if}
        </button>
        <!-- Import Data into Google Sheets -->
        <button
          on:click={importGoogleSheetData}
          disabled={isImportingData}
          class="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {#if isImportingData}
            <Loader2 class="w-4 h-4 mr-2 animate-spin" />
            Importing...
          {:else}
            <RefreshCw class="w-4 h-4 mr-2" />
            Import Data from Google Sheets
          {/if}
        </button>

        <!-- Sync Results Section (only shown when sync has been performed) -->
        {#if syncResults}
          <div class="bg-gray-50 rounded-xl p-5">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle class="w-5 h-5" />
              Sync Results
            </h3>

            <!-- Products Errors -->
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-700">Products Sheet</h4>
                <span class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  {syncResults[0]?.length || 0} errors
                </span>
              </div>
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="max-h-60 overflow-y-auto">
                  {#if syncResults[0] && syncResults[0].length > 0}
                    <table class="min-w-full text-sm">
                      <thead class="bg-gray-50 sticky top-0">
                        <tr>
                          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Row</th>
                          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Error</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        {#each syncResults[0] as error (error[0])}
                          <tr class="hover:bg-gray-50">
                            <td class="px-4 py-2 text-gray-600 font-mono">{error[0]}</td>
                            <td class="px-4 py-2 text-red-600">{error[1]}</td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  {:else}
                    <div class="p-4 text-center text-green-600">
                      <Check class="w-5 h-5 inline mr-1" />
                      No errors found
                    </div>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Sold Products Errors -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-700">Sold Products Sheet</h4>
                <span class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  {syncResults[1]?.length || 0} errors
                </span>
              </div>
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="max-h-60 overflow-y-auto">
                  {#if syncResults[1] && syncResults[1].length > 0}
                    <table class="min-w-full text-sm">
                      <thead class="bg-gray-50 sticky top-0">
                        <tr>
                          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Row</th>
                          <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Error</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        {#each syncResults[1] as error (error[0])}
                          <tr class="hover:bg-gray-50">
                            <td class="px-4 py-2 text-gray-600 font-mono">{error[0]}</td>
                            <td class="px-4 py-2 text-red-600">{error[1]}</td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  {:else}
                    <div class="p-4 text-center text-green-600">
                      <Check class="w-5 h-5 inline mr-1" />
                      No errors found
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
</style>