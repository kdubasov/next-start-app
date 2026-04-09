// src/shared/api/instructions/mock/dataset.en.ts
import { CATEGORY_SLUGS } from './categories';
import { generateDataset } from './generate';

export const DATASET_EN = generateDataset('en', CATEGORY_SLUGS, 50, 0xa1b2c3);
