'use client';

import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type Ref,
} from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/src/shared/lib/cn';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

type TContentProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>;

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  TContentProps
>(
  (
    { className, sideOffset = 4, ...props },
    ref: Ref<ElementRef<typeof TooltipPrimitive.Content>>,
  ) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(className)}
        {...props}
      />
    </TooltipPrimitive.Portal>
  ),
);
TooltipContent.displayName = 'TooltipContent';
