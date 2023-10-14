import { Product } from "./product";
import { Company } from "./sale";

export interface Partner {
  id: number | null;
}

export interface OrderItem {
  id: number | null;
  product: Product;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  remark: string | null;
}

export interface Order {
  id: number | null;
  orderNo: string;
  invoiceId: string | number;
  date: string;
  partner: Partner;
  company: Company;
  price: {
    parcel: number | null;
    total: number | null;
  }
  items: OrderItem[]
}