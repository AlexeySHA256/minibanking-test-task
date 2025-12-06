import { ValueTransformer } from 'typeorm';

export const numericTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => {
    if (value === undefined) return null;
    return value;
  },
  from: (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  },
};
