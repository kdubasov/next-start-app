'use client';

import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type ReactNode,
  type Ref,
} from 'react';

import * as SelectPrimitive from '@radix-ui/react-select';

import { cn } from '@/src/shared/lib/cn';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

type TTriggerProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.Trigger
> & {
  icon?: ReactNode;
};

export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  TTriggerProps
>(
  (
    { className, children, icon, ...props },
    ref: Ref<ElementRef<typeof SelectPrimitive.Trigger>>,
  ) => (
    <SelectPrimitive.Trigger ref={ref} className={cn(className)} {...props}>
      {children}
      {icon !== undefined ? (
        icon
      ) : (
        <SelectPrimitive.Icon asChild>
          <span aria-hidden />
        </SelectPrimitive.Icon>
      )}
    </SelectPrimitive.Trigger>
  ),
);
SelectTrigger.displayName = 'SelectTrigger';

type TContentProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;

export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  TContentProps
>(
  (
    { className, children, position = 'popper', align, ...props },
    ref: Ref<ElementRef<typeof SelectPrimitive.Content>>,
  ) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(className)}
        position={position}
        align={align}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
);
SelectContent.displayName = 'SelectContent';

type TItemProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
  isIconHidden?: boolean;
};

export const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  TItemProps
>(
  (
    { className, children, isIconHidden, ...props },
    ref: Ref<ElementRef<typeof SelectPrimitive.Item>>,
  ) => (
    <SelectPrimitive.Item ref={ref} className={cn(className)} {...props}>
      <SelectPrimitive.ItemText asChild>
        <div>{children}</div>
      </SelectPrimitive.ItemText>
      {!isIconHidden && (
        <SelectPrimitive.ItemIndicator>
          <span aria-hidden>✓</span>
        </SelectPrimitive.ItemIndicator>
      )}
    </SelectPrimitive.Item>
  ),
);
SelectItem.displayName = 'SelectItem';
