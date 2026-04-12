import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import 'server-only';
import { unified } from 'unified';

export const parseMarkdown = async (md: string): Promise<string> => {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md);

  return String(result);
};
