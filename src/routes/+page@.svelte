<svelte:head>
    <title>Iain Marr Antiques</title>
</svelte:head>

<script lang="ts">
    import { onMount } from 'svelte';
    import { Printer } from 'lucide-svelte';

    import Products from './components/Products.svelte';
    import SearchBar from './components/SearchBar.svelte';
    import ProductModal from './components/modals/ProductModal.svelte';
    import PrintModal from './components/modals/printModal/PrintModal.svelte';

    import { BACKEND_URL } from './conf';
    import type { Product } from '@/models/product';
    import type { PrintRequest } from '@/types';
    import RecallModal from './components/modals/RecallModal.svelte';

    
    // Print Request Variables
    let copies = 1;
    let printReceipt = true;
    let customerName = "";
    let markAsSold = true;
    let showEmailInput = false;
    let emailAddress = "";

    let products: Product[] = [];
    let selectedProducts: Product[] = [];
    let searchTerm = '';
    let suspendedPrintRequests: PrintRequest[] = [];

    // Edit modal state
    let showEditProductModal = false;
    let showAddProductModal = false;
    let showRecallModal = false;
    let editedProduct: Product | null = null;
    let editActiveTab: 'products' | 'print' = 'products';

    // Print modal state
    let showPrintModal = false;
    let showEditPrintModal = false;

    let isLoading = false;
    let error: string | null = null;

    let showSoldItems = true;

    let sortConfig: {
        key: keyof Product;
        direction: 'asc' | 'desc';
    } = {
        key: 'sku_no',
        direction: 'asc'
    };

    let sortOptions: { id: keyof Product; name: string }[] = [
        { id: 'row_number', name: 'SKU' },
        { id: 'item_description', name: 'Name' },
        { id: 'selling_price', name: 'Price' },
    ];

    let printerConnected = false;

    // ---------- helpers ----------

    function getValue<T>(
        item: Record<string, unknown>,
        key: string,
        defaultValue: T
    ): T {
        const value = item[key];
        return value !== undefined && value !== '' ? (value as T) : defaultValue;
    }

    // ---------- data ----------

    async function fetchProducts(): Promise<void> {
        const stored = localStorage.getItem("suspendedPrintRequests");

        if (stored) {
            try {
                suspendedPrintRequests = JSON.parse(stored) as PrintRequest[];
            } catch (error) {
                console.error("Failed to parse suspendedPrintRequests", error);
                suspendedPrintRequests = [];
            }
        }
        
        try {
            isLoading = true;
            error = null;

            const response = await fetch(`${BACKEND_URL}/stock/get-stock`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: {
                data: Product[];
                printer_connected: boolean;
            } = await response.json();

            printerConnected = data.printer_connected;
            products = data.data;

        } catch (err) {
            console.error(err);
            error = 'Failed to load products. Please try again later.';
        } finally {
            isLoading = false;
        }
    }

    onMount(fetchProducts);

    // ---------- sorting ----------

    function handleSort(key: keyof Product): void {
        const direction =
            sortConfig.key === key && sortConfig.direction === 'asc'
                ? 'desc'
                : 'asc';

        sortConfig = { key, direction };
    }

    $: sortedProducts = [...products].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc'
                ? aValue - bValue
                : bValue - aValue;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        return 0;
    });

    // ---------- filtering ----------

    $: filteredProducts = sortedProducts.filter((p) =>
        (showSoldItems || !p.sold) &&
        (
            p.item_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.im_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.seller_name_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // ---------- selection ----------

    function toggleProduct(product: Product): void {
        let productCopy: Product = { ...product, quantity: 1 };
        productCopy.quantity = 1;
        if (selectedProducts.some((p) => p.sku_no === product.sku_no)) {
            selectedProducts = selectedProducts.filter(
                (p) => p.sku_no !== product.sku_no
            );
        } else {
            selectedProducts = [...selectedProducts, productCopy];
        }
    }


    function toggleAll(): void {
        selectedProducts =
            selectedProducts.length === filteredProducts.length
                ? []
                : [...filteredProducts];
    }

    function openEditModal(product: Product): void {
        editedProduct = { ...product };
        editActiveTab = 'products';
        showEditProductModal = true;
    }

    function openPrintModal(): void {
        showPrintModal = true;
    }

    function toggleSoldItems(): void {
        showSoldItems = !showSoldItems;
    }

    // ---------- utils ----------

    function formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(value);
    }

</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8 text-center pt-8 text-[#011993]">
            <h1 class="text-6xl font-engraved ">Iain Marr Antiques</h1>
            <p class="text-gray-600 mt-2">Inventory Management System</p>
        </div>

        <!-- Loading State -->
        {#if isLoading}
            <div class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span class="ml-3 text-gray-600">Loading products...</span>
            </div>
        <!-- Error State -->
        {:else if error}
            <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700">{error}</p>
                        <button 
                            on:click={fetchProducts}
                            class="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        <!-- Main Content -->
        {:else}

            <!-- Controls -->
            <SearchBar bind:showRecallModal={showRecallModal} bind:suspendedPrintRequests={suspendedPrintRequests} bind:printerConnected={printerConnected} bind:sortConfig={sortConfig} handleSort={handleSort} bind:sortOptions={sortOptions} fetchProducts={fetchProducts} bind:showAddProductModal={showAddProductModal} bind:searchTerm={searchTerm} bind:showPrintModal={showPrintModal}  bind:selectedProducts={selectedProducts}/>

            <!-- Stats Summary -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-white rounded-xl shadow p-5">
                    <div class="text-gray-500 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <span class="font-medium">Total Items</span>
                    </div>
                    <div class="text-3xl text-black font-bold mt-2">{products.length}</div>
                </div>
                
                <div class="bg-white rounded-xl shadow p-5">
                    <div class="text-gray-500 flex items-center">
                        <svg class="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="font-medium">Available</span>
                    </div>
                    <div class="text-3xl font-bold mt-2 text-black">{products.filter(p => !p.sold).length}</div>
                </div>
                
                <div class="bg-white rounded-xl shadow p-5">
                    <div class="text-gray-500 flex items-center">
                        <svg class="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="font-medium">Sold</span>
                    </div>
                    <div class="text-3xl font-bold mt-2 text-black">{products.filter(p => p.sold).length}</div>
                </div>
            </div>

            <!-- Products Grid -->
            <Products 
                bind:filteredProducts={filteredProducts}
                bind:selectedProducts={selectedProducts} 
                toggleProduct={toggleProduct} 
                openEditModal={openEditModal} 
                bind:showSoldItems={showSoldItems}
            />
            

        {/if}
    </div>
    
    <!-- Floating Action Button -->
    {#if selectedProducts.length > 0}
        <button 
            on:click={openPrintModal}
            class="fab-enter fixed bottom-6 right-6 z-50 p-4 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white flex items-center justify-center"
        >
            <Printer size={30} />
            <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {selectedProducts.length}
            </span>
        </button>
    {/if}
    
    <!-- Print/Edit Modal -->
    {#if showEditProductModal}
        <ProductModal
            bind:show={showEditProductModal}
            bind:product={editedProduct}
            fetchProducts={fetchProducts}
            />
    {/if}
            
    <!-- Add Product Modal -->
    {#if showAddProductModal}
        <ProductModal
            bind:show={showAddProductModal}
            bind:products={products}
            product={null}
            fetchProducts={fetchProducts}
        />
    {/if}
            
    {#if showPrintModal}
        <PrintModal
            bind:suspendedPrintRequests={suspendedPrintRequests}
            bind:selectedProducts={selectedProducts}
            bind:showPrintModal={showPrintModal}
            bind:products={products}

            bind:copies={copies}
            bind:printReceipt={printReceipt}
            bind:customerName={customerName}
            bind:markAsSold={markAsSold}
            bind:showEmailInput={showEmailInput}
            bind:emailAddress={emailAddress}
        />
    {/if}
    {#if showRecallModal}
        <RecallModal
            bind:suspendedPrintRequests={suspendedPrintRequests}
            bind:showPrintModal={showPrintModal}
            bind:showRecallModal={showRecallModal}
            bind:selectedProducts={selectedProducts}
            bind:copies={copies}
            bind:printReceipt={printReceipt}
            bind:customerName={customerName}
            bind:markAsSold={markAsSold}
            bind:showEmailInput={showEmailInput}
            bind:emailAddress={emailAddress}
        />
    {/if}
</div>

<style>
    /* Custom scrollbar for modal */
    .overflow-y-auto::-webkit-scrollbar {
        width: 8px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb {
        background: #c5c5c5;
        border-radius: 4px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
    
    /* Custom styles for the floating action button */
    .fab-enter {
        animation: fabEnter 0.3s ease-out forwards;
    }
    
    @keyframes fabEnter {
        from {
            transform: translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>