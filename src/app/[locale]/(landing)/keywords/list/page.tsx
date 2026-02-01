import { setRequestLocale } from 'next-intl/server';
import { KeywordsListView } from '@/features/keywords/components/keywords-list-view';

export const revalidate = 0; // 禁用缓存

export default async function KeywordsListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <KeywordsListView />;
}
