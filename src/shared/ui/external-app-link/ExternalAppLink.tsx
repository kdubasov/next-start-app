import type { AnchorHTMLAttributes, ReactNode } from 'react';

import NextLink from 'next/link';

type TProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export const ExternalAppLink = ({ href, children, ...rest }: TProps) => (
  <NextLink href={href} {...rest}>
    {children}
  </NextLink>
);
