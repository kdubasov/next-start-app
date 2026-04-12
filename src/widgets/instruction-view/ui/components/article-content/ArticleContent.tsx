import { parseMarkdown } from '@/src/widgets/instruction-view/model/markdown';

import styles from './ArticleContent.module.css';

type TProps = {
  content: string;
};

export const ArticleContent = async ({ content }: TProps) => {
  const html = await parseMarkdown(content);
  return (
    <div
      className={styles.prose}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
