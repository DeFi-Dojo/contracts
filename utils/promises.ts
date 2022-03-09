async function sequence<T>(promises: [Promise<T>]): Promise<[T]>;
async function sequence<T, U>(
  promises: [Promise<T>, Promise<U>]
): Promise<[T, U]>;
async function sequence<T, U, W>(
  promises: [Promise<T>, Promise<U>, Promise<W>]
): Promise<[T, U, W]>;
async function sequence<T, U, W, X>(
  promises: [Promise<T>, Promise<U>, Promise<W>, Promise<X>]
): Promise<[T, U, W, X]>;
async function sequence<T>(promises: Array<Promise<T>>): Promise<Array<T>>;
async function sequence<T>(promises: Array<Promise<T>>): Promise<Array<T>> {
  if (promises.length === 0) return [];
  const [firstElement, ...rest] = promises;
  return [await firstElement, ...(await sequence(rest))];
}

export { sequence };

export const parallel = Promise.all;
