<script lang="ts">
  import type { Product } from "@/models/product";
  import { BACKEND_URL } from "../../../conf";
  import EditPrintModal from "./EditPrintModal.svelte";
  import { toast } from "svelte-sonner";

  export let showPrintModal: boolean;
  export let selectedProducts : Product[];
  export let products : Product[];

  let isLoading = false;
  let showEditPrintModal = false;
  let editedProduct: null | Product = null;
  let customerName = "";
  let markAsSold = true;
  let printReceipt = true;
  let emailReceipt = false;
  let emailAddress = "";
  let emailError = "";
  let paymentType = "";
  let duplicateCount = 1;

  // Email validation function
  function validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate email on input change
  function handleEmailInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;

    emailAddress = input.value;
    if (!emailAddress) {
      emailError = "";
      return;
    }
    
    if (!validateEmail(emailAddress)) {
      emailError = "Please enter a valid email address";
    } else {
      emailError = "";
    }
  }

  // Print selected products
  async function printLabels() {
    // Final email validation before submission
    if (emailReceipt && emailAddress && !validateEmail(emailAddress)) {
      emailError = "Please enter a valid email address";
      return;
    }

    isLoading = true;
    try {
      const requestBody = {
        products: selectedProducts,
        customer_name: customerName,
        email_address: emailAddress,
        mark_as_sold: markAsSold,
        copies: printReceipt ? duplicateCount : 0,
      } as {
        products: Product[];
        customer_name: string;
        mark_as_sold: boolean;
        copies: number;
        email_address: string;
      };


      const response = await fetch(BACKEND_URL+'/sales/print-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();

      if (!response.ok) {
        // Check for multiple error formats
        const errorMessage = result.detail || result.error || `HTTP error! status: ${response.status}`;
        console.error("Print request failed:", errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Update sold status if necessary
      if (markAsSold) {
        const selectedProductIds = new Set(selectedProducts.map(p => p.sku_no));
        products = products.map(product => {
          if (selectedProductIds.has(product.sku_no)) {
            return { ...product, sold: true };
          }
          return product;
        });
        selectedProducts = selectedProducts.map(product => ({ ...product, sold: true }));
      }

      let successMessage = `Successfully processed ${selectedProducts.length} item(s)!`;
      if (printReceipt) successMessage += ` Printed ${duplicateCount} copy(s).`;
      if (emailReceipt && emailAddress) successMessage += ` Email sent to ${emailAddress}.`;
      if (markAsSold) successMessage += ` Items marked as sold.`;

      toast.success(successMessage);
      selectedProducts = [];
      customerName = "";
      markAsSold = true;
      printReceipt = true;
      emailReceipt = false;
      emailAddress = "";
      emailError = "";
      showPrintModal = false;

    } catch (err) {
      console.error("Failed to process request", err);
      console.log("Error Message", err.message)
      const errorMessage = err instanceof Error ? err.message : "Failed to process request. Please check the console for details.";
      toast.error(errorMessage);
    } finally {
      isLoading = false;
    }
  }

  // Function to remove a product from selected items
  function removeProduct(product: Product) {
    selectedProducts = selectedProducts.filter(p => p.sku_no !== product.sku_no);
  }

  // Generate button text based on selected options
  $: buttonText = (() => {
    const actions = [];
    if (printReceipt) actions.push(`Print${duplicateCount > 1 ? ` (${duplicateCount})` : ''}`);
    if (emailReceipt) actions.push('Email');
    if (markAsSold) actions.push('Mark Sold');
    
    if (actions.length === 0) return 'Confirm';
    return actions.join(' & ');
  })();

  // Reactive validation for email when emailReceipt is toggled
  $: if (emailReceipt && emailAddress && !validateEmail(emailAddress)) {
    emailError = "Please enter a valid email address";
  } else if (emailReceipt && !emailAddress) {
    emailError = "Email address is required";
  } else {
    emailError = "";
  }

  // Clear email error when email receipt is disabled
  $: if (!emailReceipt) {
    emailError = "";
  }

  $: totalPrice = selectedProducts.reduce(
    (total, product) => total + product.selling_price * product.quantity,
    0
  );


</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
    <!-- Modal Header -->
    <div class="p-6 border-b flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-800">
        Print Receipts
      </h2>
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button
        on:click={() => { 
          showPrintModal = false; 
          customerName = ''; 
          markAsSold = true; 
          printReceipt = true;
          emailReceipt = false;
          emailAddress = '';
          emailError = '';
          paymentType = ''; 
          duplicateCount = 1; 
        }}
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
      
      <!-- Compact Options Row -->
      <div class="mb-6">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="grid grid-cols-3 gap-3">
          <!-- Email Receipt Checkbox -->
           <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div class="p-3 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer h-full" 
               on:click={() => {emailReceipt = !emailReceipt}}>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <input
                  id="emailReceipt"
                  type="checkbox"
                  bind:checked={emailReceipt}
                  class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <p class="ml-2 block text-sm font-medium text-gray-700">
                  Email Receipt
                </p>
              </div>
              <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p class="text-xs text-purple-600">
              {#if emailReceipt}
                Email receipt will be sent
              {:else}
                No email receipt
              {/if}
            </p>
          </div>
          
          <!-- Mark as Sold Checkbox -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div class="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer h-full" 
               on:click={() => {markAsSold = !markAsSold}}>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <input
                  id="markAsSold"
                  type="checkbox"
                  bind:checked={markAsSold}
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <p class="ml-2 block text-sm font-medium text-gray-700">
                  Mark as Sold
                </p>
              </div>
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-xs text-blue-600">
              {#if markAsSold}
                Items will be marked as sold
              {:else}
                Items remain available
              {/if}
            </p>
          </div>
          
          <!-- Print Receipt Checkbox with Counter -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div class="p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer h-full" on:click={() => {printReceipt = !printReceipt}}>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <input
                  id="printReceipt"
                  type="checkbox"
                  bind:checked={printReceipt}
                  class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <p class="ml-2 block text-sm font-medium text-gray-700">
                  Print Receipt
                </p>
              </div>
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z"></path>
              </svg>
            </div>
            {#if printReceipt}
              <div class="flex items-center justify-between mt-1">
                <button 
                  type="button" 
                  class="bg-white text-gray-600 hover:bg-gray-100 border border-gray-300 rounded p-1 h-6 w-6 flex items-center justify-center text-lg"
                  on:click|stopPropagation={() => duplicateCount > 1 ? duplicateCount-- : null}
                  disabled={duplicateCount <= 1}
                >
                  -
                </button>
                <span class="text-xs font-medium text-gray-700">{duplicateCount} {duplicateCount === 1 ? 'copy' : 'copies'}</span>
                <button 
                  type="button" 
                  class="bg-white text-gray-600 hover:bg-gray-100 border border-gray-300 rounded p-1 h-6 w-6 flex items-center justify-center text-lg"
                  on:click|stopPropagation={() => duplicateCount < 10 ? duplicateCount++ : null}
                  disabled={duplicateCount >= 10}
                >
                  +
                </button>
              </div>
            {:else}
              <p class="text-xs text-green-600">No print copy</p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Email Input (Conditional) -->
      {#if emailReceipt}
        <div class="mb-6 p-4 bg-purple-50 rounded-lg border {emailError ? 'border-red-300' : 'border-purple-200'}">
          <p class="block text-sm font-medium text-purple-700 mb-2">
            Email Address <span class="text-red-500">*</span>
          </p>
          <input
            id="emailAddress"
            type="email"
            value={emailAddress}
            on:input={handleEmailInput}
            placeholder="Enter customer email address"
            class="w-full px-4 py-2 border text-black {emailError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-purple-300 focus:ring-purple-500 focus:border-purple-500'} rounded-lg focus:ring-2"
            required
          />
          {#if emailError}
            <div class="flex items-center mt-2 text-red-600">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm font-medium">{emailError}</p>
            </div>
          {:else}
            <p class="mt-1 text-sm text-purple-600">
              The receipt will be sent to this email address.
            </p>
          {/if}
        </div>
      {/if}
      
      <div>
        <div class="mb-4">
          <p class="text-gray-600">You're about to process {selectedProducts.length} products.</p>
          {#if selectedProducts.length > 0}
            <p class="text-sm text-gray-500 mt-1">Click the X button to remove items from the list</p>
          {/if}
        </div>
        
        <div class="space-y-3">
          {#each selectedProducts as product}
            <div class={`flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50
                ${product.sold ? 'bg-red-50 border-red-200' : ''}`}>
              <div class="flex-1 min-w-0">
                <div class="flex items-center">
                  <h3 class="font-semibold text-gray-800 truncate">{product.item_description}</h3>
                  {#if product.sold}
                    <span class="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Sold</span>
                  {/if}
                </div>
                <div class="flex items-center mt-1 text-sm">
                  <span class="font-medium text-blue-600">£{product.selling_price.toFixed(2)}</span>
                  <span class="mx-2 text-gray-300">•</span>
                  <span class="text-gray-600 truncate">{product.sku_no}</span>
                </div>
              </div>

              
              <!-- Action buttons container -->
              <div class="flex items-center space-x-2">

                <!-- Quantity control -->
                <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                    on:click={() => product.quantity = Math.max(1, product.quantity - 1)}
                    disabled={product.quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
  
                  <span class="px-4 py-1 text-sm font-medium text-gray-800 min-w-[2rem] text-center">
                    {product.quantity}
                  </span>
  
                  <button
                    class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    on:click={() => product.quantity += 1}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <!-- Edit button -->
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
                
                <!-- Remove button -->
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
              <div class="flex items-center space-x-2">




              <!-- Edit -->
              <!-- Remove -->
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
        <div class="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg flex justify-between items-center">
          <span class="text-lg font-medium text-gray-700">
            Total
          </span>
          <span class="text-xl font-bold text-gray-900">
            £{totalPrice.toFixed(2)}
          </span>
        </div>

      </div>
    </div>
    
    <!-- Modal Footer -->
    <div class="p-6 border-t flex justify-end space-x-3">
      <button 
        on:click={() => { 
          showPrintModal = false; 
          customerName = ''; 
          markAsSold = true; 
          printReceipt = true;
          emailReceipt = false;
          emailAddress = '';
          emailError = '';
          paymentType = ''; 
          duplicateCount = 1; 
        }}
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
        disabled={isLoading || selectedProducts.length === 0 || (!emailReceipt && !markAsSold && !printReceipt) || (emailReceipt && (!emailAddress || !!emailError))}
        >
        {#if isLoading}
          <!-- Spinner -->
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-white">Processing...</span>
        {:else}
          <span class="text-white">
            {buttonText}
          </span>
        {/if}
      </button>
    </div>
  </div>
</div>

{#if showEditPrintModal}
  <EditPrintModal bind:showEditPrintModal={showEditPrintModal} bind:editedProduct={editedProduct} bind:selectedProducts={selectedProducts}/>
{/if}