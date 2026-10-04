export const api = {
  get: async <T>(r: string): Promise<T[]> => (await fetch(`/api/${r}`)).json(),
};
