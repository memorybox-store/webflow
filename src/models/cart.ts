import { Product } from "./product";
import { Company } from "./sale";

export interface CartItem {
  id: string | null;
  quantity: number;
  product: Product;
}