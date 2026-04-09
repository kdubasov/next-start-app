export type TClassValue = string | number | null | false | undefined;

export const cn = (...args: TClassValue[]): string =>
  args.filter(Boolean).join(' ');
