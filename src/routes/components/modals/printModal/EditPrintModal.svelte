<script lang="ts">
  import type { Product } from "@/models/product";


    export let showEditPrintModal;
    export let editedProduct: Product | null; 
    export let selectedProducts: Product[] | null;

    // Save edited product
    function saveEditedProduct() {
        if (editedProduct) {
            selectedProducts = (selectedProducts ?? []).map( p => p.sku_no === editedProduct!.sku_no ? editedProduct! : p );

            editedProduct = null;
            showEditPrintModal = false;
        }
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
                on:click={() => { showEditPrintModal = false; }}
                class="text-gray-400 hover:text-gray-600"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        

        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-6">
            {#if editedProduct}
                <!-- Product Details -->
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input 
                            type="text" 
                            class="text-black/50 w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed" 
                            bind:value={editedProduct.sku_no}
                            disabled
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input 
                            type="text" 
                            class="text-black w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            bind:value={editedProduct.item_description}
                        />
                    </div>  

                    <div>
                        <label class="text-black block text-sm font-medium text-gray-700 mb-1">Selling Price (£)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            class="text-black w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            bind:value={editedProduct.selling_price}
                        />
                    </div>



                </div>
                

            {/if}
        </div>
        
        <!-- Modal Footer -->
        <div class="p-6 border-t flex justify-end space-x-3">
            
            <button 
                on:click={() => { showEditPrintModal = false}}
                class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
                Cancel
            </button>
            
            <button 
                on:click={saveEditedProduct}
                class="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
                Save Changes
            </button>
        </div>
    </div>
</div>