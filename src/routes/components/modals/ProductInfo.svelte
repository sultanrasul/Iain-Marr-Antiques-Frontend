<script lang="ts">
  import type { Product } from '@/models/product';
  import { ArrowLeft, DollarSign, FileText, Info, LucideCalendar, MapPin, Package, Printer, ShoppingBag, Tag, User, Edit, X, Check, Loader2 } from 'lucide-svelte';
  import { BACKEND_URL } from '../../conf';
  import { toast } from "svelte-sonner";
  export let fetchProducts: () => Promise<void>;

  // Props – the product to display
  export let product: Product | null;

  // Helper functions
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(value);
  }

  // Reactive editable copy
  let editableProduct: Product;
  $: if (product) editableProduct = { ...product };

  // Edit mode state
  let isEditing = false;

  // Track if there are unsaved changes
  $: hasChanges = isEditing && product && editableProduct &&
    JSON.stringify(editableProduct) !== JSON.stringify(product);

  // Current product to display (editable copy when editing, original otherwise)
  $: currentProduct = isEditing ? editableProduct : product;

  // Enter edit mode – reset editable copy to latest product state
  function startEdit() {
    if (product) {
      editableProduct = { ...product };
      isEditing = true;
    }
  }

  // Cancel editing – discard changes
  function cancelEdit() {
    isEditing = false;
    // editableProduct will be reset when product changes, but we explicitly reset to original product
    if (product) editableProduct = { ...product };
  }

  let isSaving = false;
  async function saveChanges() {
    isSaving = false;

    try {
        isSaving = true;
        if (editableProduct){
            const res = await fetch(`${BACKEND_URL}/stock/modify-products`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
              },
              body: JSON.stringify([editableProduct])
            });
    
            if (!res.ok) throw new Error("Request failed");
            
            toast.success("Product updated successfully!");
    
    
            isEditing = false;
            isSaving = true;
            fetchProducts();
        }
    } catch (err) {
        console.error(err);
        toast.error("Failed to save product");
    } finally {
        isSaving = true;
    }
  }
</script>

{#if product}
  <div class="min-h-screen rounded-lg bg-gray-50 p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Product summary card (now reflects current values) -->
      <!-- <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div class="p-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div class="flex items-start gap-4">
              <div class="p-3 bg-blue-50 rounded-xl">
                <Package class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div class="text-sm font-medium text-gray-500 mb-1">SKU</div>
                <div class="text-2xl font-bold text-gray-900 font-mono tracking-tight">
                  {currentProduct?.sku_no}
                </div>
              </div>
            </div>


            <div class="flex flex-wrap gap-2">
              {#if currentProduct?.im_sku}
                <div class="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Tag class="w-3.5 h-3.5 text-gray-500" />
                  <span class="text-sm text-gray-700">IM: {currentProduct.im_sku}</span>
                </div>
              {/if}
              <div class="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                <Package class="w-3.5 h-3.5 text-gray-500" />
                <span class="text-sm text-gray-700">Qty: {currentProduct?.quantity}</span>
              </div>
              <div class="flex items-center gap-1.5 bg-blue-100 px-3 py-1.5 rounded-full">
                <DollarSign class="w-3.5 h-3.5 text-blue-600" />
                <span class="text-sm font-semibold text-blue-700">
                  {formatCurrency(currentProduct?.selling_price ?? 0)}
                </span>
              </div>
              {#if currentProduct?.purchase_price}
                <div class="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                  <ShoppingBag class="w-3.5 h-3.5 text-gray-500" />
                  <span class="text-sm text-gray-700">Cost: {formatCurrency(currentProduct.purchase_price)}</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div> -->

      <!-- Main details card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Info class="w-5 h-5 text-blue-600" />
            Product Information
          </h2>
          <div class="flex items-center gap-2">
            {#if !isEditing}
              <button
                on:click={startEdit}
                class="text-black flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Edit product"
              >
                <Edit class="w-4 h-4" />
                <span>Edit</span>
              </button>
            {:else}
              <button
                on:click={cancelEdit}
                class="text-black flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Cancel editing"
              >
                <X class="w-4 h-4" />
                <span>Cancel</span>
              </button>

                <button on:click={saveChanges} disabled={!hasChanges || isSaving} class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {#if isSaving}
                        <Loader2 class="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                    {:else}
                        <Check class="w-4 h-4" />
                        <span>Update Product</span>
                    {/if}
                </button>
            {/if}
          </div>
        </div>

        <!-- Form-like grid with dynamic input/readonly states -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <!-- SKU (always read-only, as it's an identifier) -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <Package class="w-4 h-4" />
                SKU
              </label>
              <input type="text" readonly value={currentProduct?.sku_no ?? ''} class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 font-mono text-sm focus:outline-none cursor-default"/>
            </div>

            <!-- IM SKU -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <Tag class="w-4 h-4" />
                IM SKU
              </label>
              {#if isEditing}
                <input type="text" bind:value={editableProduct.im_sku} class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              {:else}
                <input type="text" readonly value={currentProduct?.im_sku || '—'} class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none cursor-default"/>
              {/if}
            </div>

            <!-- Description -->
            <div class="md:col-span-2 space-y-1.5">
              <label class="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <FileText class="w-4 h-4" />
                Description
              </label>
              {#if isEditing}
                <textarea
                  bind:value={editableProduct.item_description}
                  rows="2"
                  class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
              {:else}
                <textarea
                  readonly
                  rows="2"
                  class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none cursor-default resize-none"
                >{currentProduct?.item_description || '—'}</textarea>
              {/if}
            </div>

            <!-- Selling Price -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <DollarSign class="w-4 h-4" />
                Selling Price
              </label>
              {#if isEditing}
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    bind:value={editableProduct.selling_price}
                    class="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              {:else}
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                  <input
                    type="text"
                    readonly
                    value={formatCurrency(currentProduct?.selling_price ?? 0).replace('£', '')}
                    class="w-full bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-gray-800 font-medium text-sm focus:outline-none cursor-default"
                  />
                </div>
              {/if}
            </div>

            <!-- Purchase Price -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <ShoppingBag class="w-4 h-4" />
                Purchase Price
              </label>
              {#if isEditing}
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    bind:value={editableProduct.purchase_price}
                    class="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              {:else}
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                  <input
                    type="text"
                    readonly
                    value={formatCurrency(currentProduct?.purchase_price ?? 0).replace('£', '')}
                    class="w-full bg-gray-50 border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-gray-800 text-sm focus:outline-none cursor-default"
                  />
                </div>
              {/if}
            </div>

            <!-- Quantity -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <Package class="w-4 h-4" />
                Quantity
              </label>
              {#if isEditing}
                <input
                  type="number"
                  step="1"
                  min="0"
                  bind:value={editableProduct.quantity}
                  class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              {:else}
                <input
                  type="text"
                  readonly
                  value={currentProduct?.quantity}
                  class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none cursor-default"
                />
              {/if}
            </div>

            <!-- Date Bought -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <LucideCalendar class="w-4 h-4" />
                Date Bought
              </label>
              {#if isEditing}
                <input
                  type="date"
                  bind:value={editableProduct.date_bought}
                  class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              {:else}
                <input
                  type="text"
                  readonly
                  value={currentProduct?.date_bought || '—'}
                  class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none cursor-default"
                />
              {/if}
            </div>

            <!-- Seller Name / Address -->
            <div class="md:col-span-2 space-y-1.5">
              <label class="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <User class="w-4 h-4" />
                Seller / Address
              </label>
              {#if isEditing}
                <textarea
                  bind:value={editableProduct.seller_name_address}
                  rows="3"
                  class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
              {:else}
                <textarea
                  readonly
                  rows="3"
                  class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none cursor-default resize-none"
                >{currentProduct?.seller_name_address || '—'}</textarea>
              {/if}
            </div>

            <!-- Notes -->
            <div class="md:col-span-2 space-y-1.5">
              <label class="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <FileText class="w-4 h-4" />
                Notes
              </label>
              {#if isEditing}
                <textarea
                  bind:value={editableProduct.notes}
                  rows="3"
                  class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
              {:else}
                <textarea
                  readonly
                  rows="3"
                  class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none cursor-default resize-none"
                >{currentProduct?.notes || 'No additional notes'}</textarea>
              {/if}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
{/if}

<style>
  button {
    transition: all 0.2s;
  }
</style>