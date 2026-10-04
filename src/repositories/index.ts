// Swap JsonRepository for a DbRepository later; nothing else changes.
import rates from "@/data/rates.json";
import categories from "@/data/categories.json";
import business from "@/data/business.json";
import settings from "@/data/settings.json";
import calculationTypes from "@/data/calculationTypes.json";
import customers from "@/data/customers.json";
import quotations from "@/data/quotations.json";
export interface Repository<T> {
  getAll(): Promise<T[]>;
}
class JsonRepository<T> implements Repository<T> {
  constructor(private d: T[]) {}
  async getAll() {
    return this.d;
  }
}
export const repos: Record<string, Repository<unknown>> = {
  rates: new JsonRepository(
    rates.filter((r) => r.active).sort((a, b) => a.sortOrder - b.sortOrder),
  ),
  categories: new JsonRepository(categories),
  business: new JsonRepository([business]),
  settings: new JsonRepository([settings]),
  calculationTypes: new JsonRepository(calculationTypes),
  customers: new JsonRepository(customers as unknown[]),
  quotations: new JsonRepository(quotations as unknown[]),
};
