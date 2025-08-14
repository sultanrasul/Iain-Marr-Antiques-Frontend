<script>
// @ts-nocheck

  import EditPrintModal from "./EditPrintModal.svelte";

// @ts-nocheck

    export let showPrintModal;
    export let selectedProducts;
    export let printSelected;
    let showEditPrintModal;

    let editedProduct = null;


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
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button
                on:click={() => { showPrintModal = false}}
                class="text-gray-400 hover:text-gray-600"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        

        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-6">
            <div>
                <div class="mb-4">
                    <p class="text-gray-600">You're about to print Receipts for {selectedProducts.length} products.</p>
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
                            <button 
                                on:click={() => {editedProduct = product; showEditPrintModal = true;}}
                                class="ml-4 text-blue-600 hover:text-blue-800 flex items-center text-sm"
                            >
                                Edit Print Info
                                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="p-6 border-t flex justify-end space-x-3">


            <button 
                on:click={() => { showPrintModal = false;}}
                class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
                Back
            </button>
            
            <button 
                on:click={printSelected}
                class="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
                Print Receipts
            </button>
        </div>
    </div>
</div>

{#if showEditPrintModal}
    <EditPrintModal bind:showEditPrintModal={showEditPrintModal} bind:editedProduct={editedProduct} bind:selectedProducts={selectedProducts}/>
{/if}