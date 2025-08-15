<script>
  import { BACKEND_URL } from "../../conf";

// @ts-nocheck

    export let saveEditedProduct;
    export let showAddProductModal;
    export let products;
    let isLoading;
    let error = null;

    
    function incrementSKU(sku) {
        // Match prefix (letters), number, and optional suffix (letters)
        const match = sku.match(/^([A-Za-z\s]*)(\d+)([A-Za-z]*)$/);
        
        if (!match) {
            console.error("Invalid SKU format:", sku);
            return sku; // fallback if pattern doesn't match
        }
        
        const prefix = match[1];        // e.g. "IMA "
        const number = parseInt(match[2], 10); // e.g. 1787
        const suffix = match[3];        // e.g. "a" or ""
        
        const newNumber = number + 1;
        
        return `${prefix}${newNumber}${suffix}`;
    }
    
    let newestAddedProductSKU = products[products.length -1].sku
    console.log(newestAddedProductSKU)

    let activeTab = "products";
    let product = {
                id: incrementSKU(newestAddedProductSKU),
                name: "",
                price: 0,
                imSKU: "",
                sku: incrementSKU(newestAddedProductSKU),
                purchasePrice: 0,
                seller: "",
                dateBought: "",
                sold: false,
                commission: 0,
                dateSold: "",
                invoiceNo: "",
                onWebsite: false,
                location: ""
            };


    async function addProduct(editedProduct){
        // Fetch data from your endpoint
        isLoading = true;

        try {
            const response = await fetch(BACKEND_URL+'/add_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    product: product
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
        } catch (err) {
            console.error("Failed to fetch products:", err);
            error = "Failed to load products. Please try again later.";
        } finally {
            isLoading = false;
        }
        

        console.log("This is the new edited data", editedProduct);
    }

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(value);
    };

    // Add this helper function
    function isEmptyOrZero(value) {
        return value === '' || value === 0 || value === null || value === undefined;
    }

</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-800">
                Edit Product
            </h2>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button
                on:click={() => { showAddProductModal = false; }}
                class="text-gray-400 hover:text-gray-600"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        
        <!-- Tab Navigation -->
        <div class="border-b">
            <div class="flex">
                <button 
                    class={`px-6 py-3 font-medium text-sm ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    on:click={() => activeTab = 'products'}
                >
                    Product Details
                </button>
                <button 
                    class={`px-6 py-3 font-medium text-sm ${activeTab === 'print' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    on:click={() => activeTab = 'print'}
                    disabled={!product}
                >
                    Print Preview
                </button>
            </div>
        </div>

        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-6">
        <!-- Product Details Tab -->
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div class="flex items-center mb-1">
                            <label class="block text-sm font-medium text-gray-700">SKU</label>
                            <!-- {#if isEmptyOrZero(product.sku)}
                                <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                            {/if} -->
                        </div>
                        <input 
                            type="text" 
                            class={`border-gray-300 bg-gray-100 text-black/50 w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed`}
                            bind:value={product.sku}
                        />
                    </div>
                    
                    <div>
                        <div class="flex items-center mb-1">
                            <label class="block text-sm font-medium text-gray-700">IM SKU</label>
                            {#if isEmptyOrZero(product.imSKU)}
                                <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                            {/if}
                        </div>
                        <input 
                            type="text" 
                            class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                ${isEmptyOrZero(product.imSKU) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                            bind:value={product.imSKU}
                        />
                    </div>
                </div>
                <div>
                    <div class="flex items-center mb-1">
                        <label class="block text-sm font-medium text-gray-700">Product Name</label>
                        {#if isEmptyOrZero(product.name)}
                            <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                        {/if}
                    </div>
                    <input 
                        type="text" 
                        class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${isEmptyOrZero(product.name) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                        bind:value={product.name}
                    />
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div class="flex items-center mb-1">
                            <label class="text-black block text-sm font-medium text-gray-700">Selling Price (£)</label>
                            {#if product.price === 0}
                                <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Zero</span>
                            {/if}
                        </div>
                        <input 
                            type="number" 
                            step="0.01"
                            class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                ${product.price === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                            bind:value={product.price}
                        />
                    </div>
                    <div>
                        <div class="flex items-center mb-1">
                            <label class="block text-sm font-medium text-gray-700">Purchase Price (£)</label>
                            {#if product.purchasePrice === 0}
                                <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Zero</span>
                            {/if}
                        </div>
                        <input 
                            type="number" 
                            step="0.01"
                            class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                ${product.purchasePrice === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                            bind:value={product.purchasePrice}
                        />
                    </div>
                </div>
                
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div class="flex items-center mb-1">
                            <label class="block text-sm font-medium text-gray-700">Seller</label>
                            {#if isEmptyOrZero(product.seller)}
                                <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                            {/if}
                        </div>
                        <input 
                            type="text" 
                            class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                ${isEmptyOrZero(product.seller) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                            bind:value={product.seller}
                        />
                    </div>
                    
                    <div>
                        <div class="flex items-center mb-1">
                            <label class="block text-sm font-medium text-gray-700">Location</label>
                            {#if isEmptyOrZero(product.location)}
                                <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                            {/if}
                        </div>
                        <input 
                            type="text" 
                            class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                ${isEmptyOrZero(product.location) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                            bind:value={product.location}
                        />
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div class="flex items-center mb-1">
                            <label class="block text-sm font-medium text-gray-700">Date Bought</label>
                            {#if isEmptyOrZero(product.dateBought)}
                                <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                            {/if}
                        </div>
                        <input 
                            type="text" 
                            class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                ${isEmptyOrZero(product.dateBought) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                            bind:value={product.dateBought}
                        />
                    </div>
                    <div>
                        <div class="flex items-center mb-1">
                            <label class="block text-sm font-medium text-gray-700">Date Sold</label>
                            {#if isEmptyOrZero(product.dateSold)}
                                <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                            {/if}
                        </div>
                        <input 
                            type="text" 
                            class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                ${isEmptyOrZero(product.dateSold) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                            bind:value={product.dateSold}
                        />
                    </div>
                    
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div class="flex items-center mb-1">
                            <label class="block text-sm font-medium text-gray-700">Commission (£)</label>
                            {#if product.commission === 0}
                                <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Zero</span>
                            {/if}
                        </div>
                        <input 
                            type="number" 
                            step="0.01"
                            class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                ${product.commission === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                            bind:value={product.commission}
                        />
                    </div>
                    
                    <div>
                        <div class="flex items-center mb-1">
                            <label class="block text-sm font-medium text-gray-700">Invoice No</label>
                            {#if isEmptyOrZero(product.invoiceNo)}
                                <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                            {/if}
                        </div>
                        <input 
                            type="text" 
                            class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                ${isEmptyOrZero(product.invoiceNo) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                            bind:value={product.invoiceNo}
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
                                bind:checked={product.onWebsite}
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
                                bind:checked={product.sold}
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
            
            

        </div>
        
        <!-- Modal Footer -->
        <div class="p-6 border-t flex justify-end space-x-3">
            
            <button 
                on:click={() => { showAddProductModal = false}}
                class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
                Cancel
            </button>
            
            <button 
                on:click={addProduct}
                class="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
                Add Product
            </button>
        </div>
    </div>
</div>