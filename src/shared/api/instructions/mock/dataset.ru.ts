// src/shared/api/instructions/mock/dataset.ru.ts

import { generateDataset } from './generate';
import { CATEGORY_SLUGS } from './categories';

export const DATASET_RU = generateDataset('ru', CATEGORY_SLUGS, 50, 0xA1B2C3);
