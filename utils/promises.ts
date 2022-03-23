async function sequence<T>(promises: [() => Promise<T>]): Promise<[T]>;
async function sequence<T, U>(
  promises: [() => Promise<T>, () => Promise<U>]
): Promise<[T, U]>;
async function sequence<T, U, W>(
  promises: [() => Promise<T>, () => Promise<U>, () => Promise<W>]
): Promise<[T, U, W]>;
async function sequence<T, U, W, X>(
  promises: [
    () => Promise<T>,
    () => Promise<U>,
    () => Promise<W>,
    () => Promise<X>
  ]
): Promise<[T, U, W, X]>;
async function sequence<T>(
  promiseFns: Array<() => Promise<T>>
): Promise<Array<T>>;
async function sequence<T>(
  promiseFns: Array<() => Promise<T>>
): Promise<Array<T>> {
  if (promiseFns.length === 0) return [];
  const [firstElementFn, ...restFns] = promiseFns;
  return [await firstElementFn(), ...(await sequence<T>(restFns))];
}

export { sequence };

export const parallel = Promise.all;

export const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const resultToPromiseFn =
  <F extends (...args: any[]) => Promise<any>>(f: F) =>
  (...args: Parameters<F>) =>
  () =>
    f(...args);
