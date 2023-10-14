import { Boat, Company } from "./sale";

export interface Product {
  id: string | null;
  name: string | null;
  description: string | null;
  tag: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  price: number | null;
  details: ProductDetail;
  boat: Boat | null;
  company: Company;
  image: {
    marked: string | null;
    unmarked?: string | null;
  }
}

export interface ProductDetail {
  id: string | null;
  sku?: string | null;
  optionId?: string | null;
  option?: string | null;
  status?: string | null;
  image?: {
    marked: string | null;
    unmarked?: string | null;
  };
  unit?: {
    id?: number | null;
    name?: number | null;
    price?: number | null;
  }
  package?: {
    depth: number | null;
    height: number | null;
    width: number | null;
    weight: number | null;
  },
  file?: {
    id?: string | null;
    name?: string | null;
  };
  referenceId: string | null;
}