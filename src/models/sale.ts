export interface Company {
  id: number | null;
  title: string | null;
  name: string | null;
  shortname?: string | null;
  branch: string | null;
  contactPerson: string | null;
  tel: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  image: string | null;
}

export interface Boat {
  id: number | null;
  name: string | null;
  prefix: string | null;
  createdAt: string | null;
}