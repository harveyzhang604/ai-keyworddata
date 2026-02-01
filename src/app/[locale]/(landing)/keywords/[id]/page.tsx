import { KeywordDetailView } from '@/features/keywords/components/keyword-detail-view';

export default function KeywordDetailPage({ params }: { params: { id: string } }) {
  return <KeywordDetailView keywordId={params.id} />;
}
