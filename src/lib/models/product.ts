export interface Product {
  row_number?: number;

  sku_no: string;
  im_sku: string;

  item_description: string;

  quantity: number;
  selling_price: number;
  purchase_price: number;
  commission: number;

  date_bought: string; // empty string or "DD.MM.YY"
  date_sold: string;

  seller_name_address: string;
  invoice_no_xero: string;

  sold: boolean;
  on_website: boolean;

  location: string;
  photograph: string;
}
