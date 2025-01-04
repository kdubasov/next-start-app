import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'dynamic route',
  description: 'test',
};

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const propsParams = await params;

  return <h1>{propsParams.id}</h1>;
};

export default Page;
