import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import 'server-only';
import { unified } from 'unified';

const unescapeLiterals = (md: string): string =>
  md
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');

export const parseMarkdown = async (md: string): Promise<string> => {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(unescapeLiterals(md));

  return String(result);
};
