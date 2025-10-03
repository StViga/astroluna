/**
 * Utility function for combining CSS class names conditionally
 * Similar to clsx but simpler implementation
 */
export function classNames(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export { classNames as clsx, classNames as cn };