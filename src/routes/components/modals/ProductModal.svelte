<script lang="ts">
  import { BACKEND_URL } from "../../conf";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";
  import type { Product } from "@/models/product";

  export let show = false;
  export let products: Product[] = [];
  export let fetchProducts: () => Promise<void>;
  export let product: Product | null = null; // ← if provided = edit, otherwise add
  console.log("Selected Product: ",product)

  let isSaving = false;
   let originalProduct: Product | null = null; // ← if provided = edit, otherwise add
  let activeTab = "products";

  const isEditMode = !!product;

    function incrementSKU(sku: string): string {
        // Match: numeric part before dash, numeric part after dash
        const match = sku.match(/^(\d+)-(\d+)$/);
        if (!match) return sku;

        let [_, major, minor] = match;

        let minorNum = parseInt(minor, 10);

        // If minor is 999, roll over
        if (minorNum === 999) {
            let majorNum = parseInt(major, 10) + 1;
            // Minor resets to 0
            return `${majorNum}-00`;
        }

        minorNum += 1;

        // Preserve leading zeros for minor
        const minorLength = minor.length;
        return `${major}-${minorNum.toString().padStart(minorLength, '0')}`;
    }



  function createNewProduct() : Product {
    const lastSku = products?.[products.length - 1]?.sku_no ?? "0";
    // const lastSku = "2-999";

    return {
      sku_no: incrementSKU(lastSku),
      im_sku: "",
      item_description: "",
      selling_price: 0,
      purchase_price: 0,
      seller_name_address: "",
      date_bought: "",
      sold: false,
      commission: 0,
      date_sold: "",
      invoice_no_xero: "",
      on_website: false,
      location: "",
      quantity: 1,
      photograph: ""
    };
  }

  let editedProduct: Product = isEditMode
    ? JSON.parse(JSON.stringify(product))
    : createNewProduct();

  onMount(() => {
    if (isEditMode) {
      originalProduct = JSON.parse(JSON.stringify(editedProduct));
    }
  });

  function isEmptyOrZero(value: string | number | null) {
    return value === "" || value === 0 || value == null;
  }

  function hasChanges() {
    return JSON.stringify(originalProduct) !== JSON.stringify(editedProduct);
  }

  async function save() {
    isSaving = true;

    try {
        const url = isEditMode
        ? "/stock/modify-product"
        : "/stock/add-product"


        const res = await fetch(BACKEND_URL + url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify(editedProduct)
        });

        if (!res.ok) throw new Error("Request failed");
        
        toast.success(isEditMode ? "Product updated successfully!" : "Product added successfully!");


        show = false;
        fetchProducts();
    } catch (err) {
        console.error(err);
        toast.error("Failed to save product");
    } finally {
        isSaving = false;
    }
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <!-- Toast Notification -->

    
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-800">
                {isEditMode ? "Edit": "Add"} Product
            </h2>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button
                on:click={() => { show = false; }}
                class="text-gray-400 hover:text-gray-600"
                disabled={isSaving}
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>

        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-6">
            {#if editedProduct}
                <!-- Product Details Tab -->
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div class="flex items-center mb-1">
                                <label class="block text-sm font-medium text-gray-700">SKU</label>
                                {#if isEmptyOrZero(editedProduct.sku_no)}
                                    <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                {/if}
                            </div>
                            <input 
                                type="text" 
                                class={`text-black/50 w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    ${isEmptyOrZero(editedProduct.sku_no) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-gray-100'}`}
                                bind:value={editedProduct.sku_no}
                                disabled={isEditMode}
                            />
                        </div>
                        
                        <div>
                            <div class="flex items-center mb-1">
                                <label class="block text-sm font-medium text-gray-700">IM SKU</label>
                                {#if isEmptyOrZero(editedProduct.im_sku)}
                                    <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                {/if}
                            </div>
                            <input 
                                type="text" 
                                class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    ${isEmptyOrZero(editedProduct.im_sku) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                bind:value={editedProduct.im_sku}
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <!-- Product Name (80%) -->
                        <div class="w-[80%]">
                            <div class="flex items-center mb-1">
                                <label class="block text-sm font-medium text-gray-700">
                                    Product Name
                                </label>
                                {#if isEmptyOrZero(editedProduct.item_description)}
                                    <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                        Empty
                                    </span>
                                {/if}
                            </div>
                            <input 
                                type="text"
                                class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    ${isEmptyOrZero(editedProduct.item_description) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                bind:value={editedProduct.item_description}
                            />
                        </div>

                        <!-- Quantity (20%) -->
                        <div class="w-[20%]">
                            <div class="flex items-center mb-1">
                                <label class="block text-sm font-medium text-gray-700 text-left w-full">
                                    Qty
                                </label>
                            </div>
                            <input 
                                type="number"
                                min="1"
                                step="1"
                                class="text-black w-full px-2 py-2.5 rounded-lg border border-gray-300 text-center
                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                bind:value={editedProduct.quantity}
                            />
                        </div>
                    </div>

                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div class="flex items-center mb-1">
                                <label class="text-black block text-sm font-medium text-gray-700">Selling Price (£)</label>
                                {#if editedProduct.selling_price === 0}
                                    <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Zero</span>
                                {/if}
                            </div>
                            <input 
                                type="number" 
                                step="0.01"
                                class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    ${editedProduct.selling_price === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                bind:value={editedProduct.selling_price}
                                disabled={isSaving}
                            />
                        </div>
                        <div>
                            <div class="flex items-center mb-1">
                                <label class="block text-sm font-medium text-gray-700">Purchase Price (£)</label>
                                {#if editedProduct.purchase_price === 0}
                                    <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Zero</span>
                                {/if}
                            </div>
                            <input 
                                type="number" 
                                step="0.01"
                                class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    ${editedProduct.purchase_price === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                bind:value={editedProduct.purchase_price}
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                    
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div class="flex items-center mb-1">
                                <label class="block text-sm font-medium text-gray-700">Seller</label>
                                {#if isEmptyOrZero(editedProduct.seller_name_address)}
                                    <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                {/if}
                            </div>
                            <input 
                                type="text" 
                                class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    ${isEmptyOrZero(editedProduct.seller_name_address) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                bind:value={editedProduct.seller_name_address}
                                disabled={isSaving}
                            />
                        </div>
                        
                        <div>
                            <div class="flex items-center mb-1">
                                <label class="block text-sm font-medium text-gray-700">Location</label>
                                {#if isEmptyOrZero(editedProduct.location)}
                                    <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                {/if}
                            </div>
                            <input 
                                type="text" 
                                class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    ${isEmptyOrZero(editedProduct.location) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                bind:value={editedProduct.location}
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div class="flex items-center mb-1">
                                <label class="block text-sm font-medium text-gray-700">Date Bought</label>
                                {#if isEmptyOrZero(editedProduct.date_bought)}
                                    <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                {/if}
                            </div>
                            <input 
                                type="text" 
                                class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    ${isEmptyOrZero(editedProduct.date_bought) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                bind:value={editedProduct.date_bought}
                                disabled={isSaving}
                            />
                        </div>
                        <div>
                            <div class="flex items-center mb-1">
                                <label class="block text-sm font-medium text-gray-700">Date Sold</label>
                                {#if isEmptyOrZero(editedProduct.date_sold)}
                                    <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                {/if}
                            </div>
                            <input 
                                type="text" 
                                class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    ${isEmptyOrZero(editedProduct.date_sold) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                bind:value={editedProduct.date_sold}
                                disabled={isSaving}
                            />
                        </div>
                        
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div class="flex items-center mb-1">
                                <label class="block text-sm font-medium text-gray-700">Commission (£)</label>
                                {#if editedProduct.commission === 0}
                                    <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Zero</span>
                                {/if}
                            </div>
                            <input 
                                type="number" 
                                step="0.01"
                                class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    ${editedProduct.commission === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                bind:value={editedProduct.commission}
                                disabled={isSaving}
                            />
                        </div>
                        
                        <div>
                            <div class="flex items-center mb-1">
                                <label class="block text-sm font-medium text-gray-700">Invoice No</label>
                                {#if isEmptyOrZero(editedProduct.invoice_no_xero)}
                                    <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                {/if}
                            </div>
                            <input 
                                type="text" 
                                class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    ${isEmptyOrZero(editedProduct.invoice_no_xero) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                bind:value={editedProduct.invoice_no_xero}
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">On Website</label>
                            <div class="flex items-center mt-2">
                                <input 
                                    type="checkbox" 
                                    id="onWebsite"
                                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    bind:checked={editedProduct.on_website}
                                    disabled={isSaving}
                                />
                                <label for="onWebsite" class="ml-2 block text-sm text-gray-900">
                                    Published on website
                                </label>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Sold Status</label>
                            <div class="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="soldCheckbox"
                                    class="text-black h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    bind:checked={editedProduct.sold}
                                    disabled={isSaving}
                                />
                                <label for="soldCheckbox" class="ml-2 block text-sm text-gray-900">
                                    Mark as sold
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Validation Summary -->
                    <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div class="flex items-center text-yellow-800">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <span class="font-medium">Note on empty fields</span>
                        </div>
                        <p class="text-sm text-yellow-700 mt-2">
                            Yellow highlighted fields are empty or contain zero values. These fields are not required, 
                            but you may want to review them before saving.
                        </p>
                    </div>
                </div>
                
            

            {/if}
        </div>
        
        <!-- Modal Footer -->
        <div class="p-6 border-t flex justify-end space-x-3">
            <button 
                on:click={() => { show = false; }}
                class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                disabled={isSaving}
            >
                Cancel
            </button>
            
            <button 
                on:click={save}
                class="px-5 py-2.5 rounded-lg flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                class:bg-blue-600={!isSaving && hasChanges()}
                class:bg-gray-400={!hasChanges() || isSaving}
                class:hover:bg-blue-700={!isSaving && hasChanges()}
                disabled={!hasChanges() || isSaving}
            >
                {#if isSaving}
                    <!-- Spinner -->
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-white">Saving...</span>
                {:else}
                    <span class="text-white"> {product ? "Save Changes" : "Add Product"}</span>
                {/if}
            </button>
        </div>
    </div>
</div>


<style>
    /* Spinner animation */
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    /* Smooth transitions */
    button, input, .bg-yellow-50 {
        transition: all 0.2s ease;
    }
    
    /* Toast animation */
    .toast-enter {
        animation: toast-enter 0.3s ease-out forwards;
    }
    
    @keyframes toast-enter {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>