<script>
  import { BACKEND_URL } from "../../../conf";
  // @ts-nocheck
  import EditPrintModal from "./EditPrintModal.svelte";
  import { toast } from "svelte-sonner";

  export let showPrintModal;
  export let selectedProducts;
  export let products;

  let isLoading = false;
  let showEditPrintModal;
  let editedProduct = null;
  let customerName = ""; // New variable for customer name
  let markAsSold = true; // New variable for marking as sold

  // Print selected products
  async function printLabels() {
    isLoading = true;
    try {
      const response = await fetch(BACKEND_URL+'/print_labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          selectedProducts: selectedProducts,
          customerName: customerName,
          logSold: markAsSold
        })
      });
      
      const result = await response.json();

      if (!response.ok) {
        // Custom error from backend
        if (result.error) {
          throw new Error(result.error);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // Update sold status if necessary
      if (markAsSold) {
        const selectedProductIds = new Set(selectedProducts.map(p => p.id));
        products = products.map(product => {
          if (selectedProductIds.has(product.id)) {
            return { ...product, sold: true };
          }
          return product;
        });
        selectedProducts = selectedProducts.map(product => ({ ...product, sold: true }));
      }

      toast.success(`Successfully printed ${selectedProducts.length} label(s)!`);
      selectedProducts = [];
      customerName = "";
      markAsSold = false;
      showPrintModal = false;

    } catch (err) {
      console.error("Failed to print labels", err);
      toast.error(err.message || "Failed to print labels. Please check the console for details.");
    } finally {
      isLoading = false;
    }
  }


  // Function to remove a product from selected items
  function removeProduct(product) {
    selectedProducts = selectedProducts.filter(p => p.id !== product.id);
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(value);
  };
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
    <!-- Modal Header -->
    <div class="p-6 border-b flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-800">
        Print Receipts
      </h2>
      <button
        on:click={() => { showPrintModal = false; customerName = ''; markAsSold = false; }}
        class="text-gray-400 hover:text-gray-600"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    <!-- Modal Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Customer Name Input -->
      <div class="mb-6">
        <label for="customerName" class="block text-sm font-medium text-gray-700 mb-2">
          Customer Name (Optional)
        </label>
        <input
          id="customerName"
          type="text"
          bind:value={customerName}
          placeholder="Enter customer name for receipt"
          class="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p class="mt-1 text-sm text-gray-500">
          The customer name will be printed on the receipt if provided.
        </p>
      </div>
      
      <!-- Mark as Sold Checkbox -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer" on:click={() => {markAsSold=!markAsSold}}>
        <div class="flex items-center">
          <input
            id="markAsSold"
            type="checkbox"
            bind:checked={markAsSold}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div  class="ml-2 block text-sm font-medium text-gray-700">
            Mark as Sold and Add to Sold Inventory
          </div>
        </div>
        <p class="mt-1 text-sm text-blue-600">
          {#if markAsSold}
            Items will be marked as sold in your inventory and added to the sold items sheet.
          {:else}
            Items will remain available in your inventory after printing.
          {/if}
        </p>
      </div>
      
      <div>
        <div class="mb-4">
          <p class="text-gray-600">You're about to print Receipts for {selectedProducts.length} products.</p>
          {#if selectedProducts.length > 0}
            <p class="text-sm text-gray-500 mt-1">Click the X button to remove items from the list</p>
          {/if}
        </div>
        
        <div class="space-y-3 max-h-96 overflow-y-auto">
          {#each selectedProducts as product}
            <div class={`flex items-center p-3 border rounded-lg hover:bg-gray-50
                ${product.sold ? 'bg-red-50 border-red-200' : ''}`}>
              <div class="flex-1 min-w-0">
                <div class="flex items-center">
                  <h3 class="font-semibold text-gray-800 truncate">{product.name}</h3>
                  {#if product.sold}
                    <span class="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Sold</span>
                  {/if}
                </div>
                <div class="flex items-center mt-1 text-sm">
                  <span class="font-medium text-blue-600">£{product.price.toFixed(2)}</span>
                  <span class="mx-2 text-gray-300">•</span>
                  <span class="text-gray-600 truncate">{product.sku}</span>
                </div>
              </div>
              
              <!-- Action buttons container -->
              <div class="flex items-center space-x-2">
                <!-- Edit button - now more prominent -->
                <button 
                  on:click={() => {editedProduct = product; showEditPrintModal = true;}}
                  class="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors flex items-center group"
                  title="Edit Print Info"
                >
                  <svg class="w-5 h-5 text-blue-600 group-hover:text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  <span class="ml-1 text-sm font-medium text-blue-600 group-hover:text-blue-800 hidden md:inline">
                    Edit
                  </span>
                </button>
                
                <!-- Remove button - now more prominent -->
                <button 
                  on:click={() => removeProduct(product)}
                  class="p-2 bg-red-50 rounded-full hover:bg-red-100 transition-colors flex items-center group"
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
          {:else}
            <div class="text-center py-8">
              <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
              </svg>
              <h3 class="mt-4 text-lg font-medium text-gray-900">No products selected</h3>
              <p class="mt-1 text-gray-500">Select items from your inventory to print receipts</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Modal Footer -->
    <div class="p-6 border-t flex justify-end space-x-3">
      <button 
        on:click={() => { showPrintModal = false; customerName = ''; markAsSold = false; }}
        class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
      >
        Back
      </button>

      <button 
        on:click={printLabels}
        class="px-5 py-2.5 rounded-lg flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
        class:bg-blue-600={!isLoading}
        class:bg-gray-400={isLoading}
        class:hover:bg-blue-700={!isLoading}
        disabled={isLoading || selectedProducts.length === 0}
      >
        {#if isLoading}
          <!-- Spinner -->
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-white">Printing...</span>
        {:else}
          <span class="text-white">
            {markAsSold ? 'Print & Mark Sold' : 'Print Receipts'}
          </span>
        {/if}
      </button>
    </div>
  </div>
</div>

{#if showEditPrintModal}
  <EditPrintModal bind:showEditPrintModal={showEditPrintModal} bind:editedProduct={editedProduct} bind:selectedProducts={selectedProducts}/>
{/if}