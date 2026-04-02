import type { Product } from "./models/product"
import type { Settings } from "./models/settings"

export type Categories = 'sveltekit' | 'svelte'

export type Post = {
	title: string
	slug: string
	description: string
	date: string
	categories: Categories[]
	published: boolean
}
export type PrintRequest = {
  products: Product[];
  customer_name: string;
  email_address: string;
  mark_as_sold: boolean;
  copies: number;
  timestamp: Date;
};

export type PrintOptions = {
  copies: number;
  printReceipt: boolean;
  customerName: string;
  markAsSold: boolean;
  showEmailInput: boolean;
  emailAddress: string;
  resetQuantity: boolean;
};

export type Stats = {
    total_products: number;
    total_orders: number;
    total_sales_rows: number;
    total_items_sold: number;
    total_revenue: number;
    unique_products_sold: number;
};

export type GetStockResponse = {
    products: Product[];
    printer_connected: boolean;
    stats: Stats;
    settings: Settings;
};