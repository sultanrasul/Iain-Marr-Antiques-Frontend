import type { Product } from "./models/product"

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
};