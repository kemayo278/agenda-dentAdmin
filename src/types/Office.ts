export interface Office {
  id: number;
  name: string;
  logo: string | null;
  address: string;
  city: string;
  postalCode: string;
  phone: string | null;
  email: string | null;
  openingHours: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}