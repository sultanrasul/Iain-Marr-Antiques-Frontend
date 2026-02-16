<script lang="ts">
  import type { Product } from "@/models/product";
  import type { PrintRequest } from "@/types";

  export let suspendedPrintRequests: PrintRequest[] = [];
  export let showPrintModal: boolean = false;
  export let showRecallModal: boolean = false;

  export let selectedProducts: Product[];
  export let copies: number;
  export let printReceipt: boolean;
  export let customerName: string;
  export let markAsSold: boolean;
  export let showEmailInput: boolean;
  export let emailAddress: string;

  let selectedSuspendedRequest: PrintRequest | null = null;
  let selectedIndex: number;
  
  let showWarningModal = false;
  let overwriteProducts = false;

  // Helper to format date/time (dummy for now – you can replace with actual timestamp later)
  function formatDateTime(timestamp?: string | Date): string {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Calculate total for a request (using selling_price and quantity)
  function getRequestTotal(request: PrintRequest): number {
    return request.products?.reduce(
      (sum, p) => sum + (p.selling_price || 0) * (p.quantity || 1),
      0
    ) || 0;
  }

  function recallSession() {
    if (!selectedSuspendedRequest) return;

    if(selectedProducts.length > 0 && !overwriteProducts){
      // Show Warning Message
      showWarningModal = true;
      return
    }

    // Your recall logic here – populate the print modal with this request's data
    // Example:
    selectedProducts = [...selectedSuspendedRequest.products];
    customerName = selectedSuspendedRequest.customer_name;
    emailAddress = selectedSuspendedRequest.email_address;
    if (emailAddress && emailAddress.length > 0) showEmailInput = true
    markAsSold = selectedSuspendedRequest.mark_as_sold;
    copies = selectedSuspendedRequest.copies;

    printReceipt = true ? copies > 0 : false;

    removeSuspendedSale(selectedIndex);
    showRecallModal = false;
    showPrintModal = true;
    
    // Reset overwrite flag for next time
    overwriteProducts = false;
  }


  function removeSuspendedSale(index: number) {
      // Remove the item at the given index
      suspendedPrintRequests = suspendedPrintRequests.filter((_, i) => i !== index);
      
      // Persist to localStorage
      localStorage.setItem("suspendedPrintRequests", JSON.stringify(suspendedPrintRequests));
      
      // If the removed item was selected, clear the selection
      if (selectedSuspendedRequest && !suspendedPrintRequests.includes(selectedSuspendedRequest)) {
          selectedSuspendedRequest = null;
      }
  }
</script>


<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
    <!-- Modal Header -->
    <div class="p-6 border-b flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-800">Recall Suspended Sale</h2>
      <button
        on:click={() => showRecallModal = false}
        class="text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Modal Content -->
    <div class="flex-1 overflow-y-auto p-6">
      {#if suspendedPrintRequests.length === 0}
        <div class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No suspended sales</h3>
          <p class="mt-1 text-gray-500">There are no saved print requests to recall.</p>
        </div>
      {:else}
        <p class="text-gray-600 mb-4">Select a suspended sale to recall:</p>
        <div class="space-y-3">
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          {#each suspendedPrintRequests as request, i}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              class="p-4 border rounded-lg cursor-pointer transition-colors
                {selectedSuspendedRequest === request 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50'}"
              on:click={() => {selectedSuspendedRequest = request;selectedIndex=i}}
            >
              <div class="flex items-start gap-3">
                <!-- Selection radio -->
                <div class="flex-shrink-0 pt-0.5">
                  <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center
                    {selectedSuspendedRequest === request 
                      ? 'border-blue-500' 
                      : 'border-gray-300'}"
                  >
                    {#if selectedSuspendedRequest === request}
                      <div class="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      {/if}
                    </div>
                  </div>
                  
                  <!-- Request details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                      <!-- Timestamp (dummy for now) -->
                      <span class="font-medium text-gray-900">
                        {formatDateTime(request.timestamp)}
                    </span>

                    <!-- Customer name badge (if exists) -->
                    {#if request.customer_name}
                      <span class="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {request.customer_name}
                      </span>
                    {/if}

                    <!-- Mark as sold badge -->
                    {#if request.mark_as_sold}
                      <span class="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                        Sold
                      </span>
                    {/if}

                    <!-- Copies indicator (if >1) -->
                    {#if request.copies > 1}
                      <span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {request.copies} copies
                      </span>
                    {/if}
                  </div>

                  <!-- Product count, total, email -->
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span class="text-gray-600">
                      {request.products?.length || 0} item(s)
                    </span>
                    <span class="text-gray-400">•</span>
                    <span class="font-medium text-blue-600">
                      £{getRequestTotal(request).toFixed(2)}
                    </span>
                    {#if request.email_address}
                        <span class="text-gray-400">•</span>
                        <span class="text-gray-500 truncate max-w-xs" title={request.email_address}>
                          {request.email_address}
                        </span>

                    {/if}
                  </div>

                  <!-- Product preview -->
                  {#if request.products && request.products.length > 0}
                    <div class="mt-2 text-xs text-gray-500 truncate">
                      {request.products.slice(0, 2).map(p => p.item_description).join(', ')}
                      {#if request.products.length > 2}…{/if}
                    </div>
                  {/if}
                </div>

                
                
                <!-- Remove button -->
                <button 
                  on:click={() => removeSuspendedSale(i)}
                  class="p-2 bg-red-50 rounded-full hover:bg-red-100 transition-colors flex items-center group self-center"
                  title="Remove from list"
                >
                  <svg class="w-5 h-5 text-red-500 group-hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  <span class="ml-1 text-sm font-medium text-red-500 group-hover:text-red-700 hidden md:inline">
                    Remove
                  </span>
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Modal Footer -->
    <div class="p-6 border-t flex justify-end space-x-3">
      <button
        class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
        on:click={() => showRecallModal = false}
      >
        Cancel
      </button>
      <button
        class="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!selectedSuspendedRequest}
        on:click={recallSession}
      >
        Recall
      </button>
    </div>
  </div>
</div>


<!-- Warning Modal (appears on top of recall modal) -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if showWarningModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-800">Replace current sale?</h2>
        <button
          on:click={() => showWarningModal = false}
          class="text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6">
        <p class="text-gray-600">
          Current selected products will be replaced with the recalled sale.
        </p>
      </div>
      
      <!-- Footer -->
      <div class="p-6 border-t flex justify-between space-x-3">
        <button
          class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
          on:click={() => showWarningModal = false}
        >
          No, go back
        </button>
        <button
          class="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
          on:click={() => { overwriteProducts = true; showWarningModal = false; recallSession(); }}
        >
          Yes, replace
        </button>
      </div>
    </div>
  </div>
{/if}