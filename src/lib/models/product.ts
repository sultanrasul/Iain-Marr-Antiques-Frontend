export interface Product {
  row_number?: number;

  sku_no: string;
  new_sku_no?: string;

  im_sku: string;

  item_description: string;

  quantity: number;
  selling_price: number;
  purchase_price: number;
  date_bought: string; // empty string or "DD.MM.YY"
  seller_name_address: string;
  notes: string;
  
  
  date_sold: string;
  invoice_no_xero: string;
  
  sold: boolean;
  on_website: boolean;
  
  commission: number;
  location: string;
  photograph: string;
}
