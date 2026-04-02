<!-- routes/sales/[order_id]/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { Calendar, User, Package, DollarSign, Receipt, ArrowLeft, Printer } from 'lucide-svelte';

  import type { Sales } from '@/models/sales';
  import type { Product } from '@/models/product';
  import { BACKEND_URL } from '../conf';
  import type { PrintOptions } from '@/types';

  export let sale: Sales | null;
  export let selectedProducts: Product[];
  export let showPrintModal: boolean = false;

  export let printOptions: PrintOptions;

  let products: Product[] = [];
  let isLoading = false;
  let error: string | null = null;

  async function fetchOrderProducts() {
    try {
      isLoading = true;
      error = null;

      const response = await fetch(`${BACKEND_URL}/stock/${sale?.order_id}/products`, {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error(`Failed to load products (${response.status})`);

      products = await response.json();
    } catch (err) {
      console.error(err);
      error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading = false;
    }
  }

  onMount(fetchOrderProducts);

  function formatCurrency(value: number | undefined): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(value ?? 0);
  }

  function formatDate(date: Date | undefined): string {
    if (!date) return '—';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  function printOrder(){
    if(sale?.customer_name) printOptions.customerName = sale.customer_name;
    selectedProducts = [...products];
    if (printOptions.emailAddress && printOptions.emailAddress.length > 0) printOptions.showEmailInput = true
    printOptions.markAsSold = false;
    printOptions.copies = 1;
    printOptions.resetQuantity = false;
    showPrintModal = true;
  }
</script>

<div class="min-h-screen bg-gray-50 p-4 md:p-8">
  <div class="max-w-7xl mx-auto">

    <!-- Order summary card -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <!-- Left: Order ID and customer -->
        <div class="flex items-start gap-4">
          <div class="p-3 bg-blue-50 rounded-lg">
            <Receipt class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Order ID</div>
            <div class="text-xl font-semibold text-gray-800 font-mono">#{sale?.order_id}</div>
          </div>
        </div>

        <!-- Right: Details badges -->
        <div class="flex flex-wrap gap-3">
          <div class="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
            <User class="w-4 h-4 text-gray-600" />
            <span class="text-sm font-medium text-gray-700">{sale?.customer_name || '—'} </span>
          </div>
          <div class="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
            <Calendar class="w-4 h-4 text-gray-600" />
            <span class="text-sm font-medium text-gray-700">{formatDate(sale?.date_sold)}</span>
          </div>
          <div class="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
            <Package class="w-4 h-4 text-gray-600" />
            <span class="text-sm font-medium text-gray-700">{sale?.items_purchased} item{sale?.items_purchased !== 1 ? 's' : ''}</span>
          </div>
          <div class="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
            <DollarSign class="w-4 h-4 text-blue-600" />
            <span class="text-sm font-bold text-blue-700">{formatCurrency(sale?.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Products section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Package class="w-5 h-5 text-blue-600" />
          Items in this order
        </h2>
        <span class="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
          {products.length} product{products.length !== 1 ? 's' : ''}
        </span>
      </div>

      {#if isLoading}
        <div class="flex justify-center py-16">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
      {:else if error}
        <div class="p-6">
          <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p class="text-red-700">{error}</p>
          </div>
        </div>
      {:else if products.length === 0}
        <div class="text-center py-16 text-gray-500">
          <Package class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p class="text-lg font-medium text-gray-600">No products found</p>
          <p class="text-sm text-gray-400 mt-1">This order may have been incomplete or deleted.</p>
        </div>
      {:else}
        <!-- Product table – clean and readable -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th class="px-6 py-3 text-left">SKU</th>
                <th class="px-6 py-3 text-left">Description</th>
                <th class="px-6 py-3 text-center">Quantity</th>
                <th class="px-6 py-3 text-right">Unit Price</th>
                <th class="px-6 py-3 text-right">Total</th>
                <th class="px-6 py-3 text-left">Location</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {#each products as product (product.sku_no)}
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 font-mono text-xs text-gray-500">{product.sku_no}</td>
                  <td class="px-6 py-4 max-w-xs truncate text-gray-800" title={product.item_description}>
                    {product.item_description}
                  </td>
                  <td class="px-6 py-4 text-center text-gray-700">{product.quantity}</td>
                  <td class="px-6 py-4 text-right font-medium text-gray-700">
                    {formatCurrency(product.selling_price)}
                  </td>
                  <td class="px-6 py-4 text-right font-medium text-blue-600">
                    {formatCurrency(product.selling_price * product.quantity)}
                  </td>
                  <td class="px-6 py-4 text-gray-600">{product.location || '—'}</td>
                </tr>
              {/each}
            </tbody>
            <tfoot class="bg-gray-50 font-semibold">
              <tr>
                <td colspan="4" class="px-6 py-4 text-right text-gray-700">Subtotal</td>
                <td class="px-6 py-4 text-right text-blue-600">
                  {formatCurrency(products.reduce((sum, p) => sum + p.selling_price * p.quantity, 0))}
                </td>
                <td></td>
              </tr>
              <!-- Optional: tax line if available -->
              <!-- <tr class="text-sm">
                <td colspan="4" class="px-6 py-2 text-right text-gray-600">VAT (20%)</td>
                <td class="px-6 py-2 text-right text-gray-800">£...</td>
                <td></td>
              </tr> -->
              <tr class="border-t-2 border-gray-300">
                <td colspan="4" class="px-6 py-4 text-right text-gray-800 text-base">Total</td>
                <td class="px-6 py-4 text-right text-blue-700 text-lg font-bold">
                  {formatCurrency(products.reduce((sum, p) => sum + p.selling_price * p.quantity, 0))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Additional order info (optional) -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between">
          <span>Order placed: {formatDate(sale?.date_sold)}</span>
          <span>•</span>
          <span>Payment method: Not specified</span>
        </div>
      {/if}
    </div>

    <div class="flex items-right justify-end mb-6 mt-6">
      <button
        on:click={printOrder}
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700"
        title="Print receipt"
      >
        <Printer class="w-4 h-4" />
        <span class="hidden sm:inline">Print</span>
      </button>
    </div>
  </div>
</div>

<style>
  /* Optional smooth transitions */
  button {
    transition: all 0.2s;
  }
</style>