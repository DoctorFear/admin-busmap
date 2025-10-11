import { clsx } from 'clsx';

export const cn = (...classes: (string | undefined)[]) => clsx(...classes);