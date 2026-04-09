// src/shared/api/instructions/mock/dataset.ru.ts
import { CATEGORY_SLUGS } from './categories';
import { generateDataset } from './generate';

export const DATASET_RU = generateDataset('ru', CATEGORY_SLUGS, 50, 0xa1b2c3);
