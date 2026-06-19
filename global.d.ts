declare global {
  // eslint-disable-next-line
  interface Window {
    // yandex metrika
    ym: (counterId: number | string | undefined, method: string, ...args: unknown[]) => void;
    // google gtag
    // eslint-disable-next-line
    gtag?: (...args: any[]) => void;
  }
}

export {};
