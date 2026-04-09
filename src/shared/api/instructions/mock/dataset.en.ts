// src/shared/api/instructions/mock/dataset.en.ts

import { generateDataset } from './generate';
import { CATEGORY_SLUGS } from './categories';

export const DATASET_EN = generateDataset('en', CATEGORY_SLUGS, 50, 0xA1B2C3);
