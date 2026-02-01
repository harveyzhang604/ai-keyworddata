/**
 * 根路径首页 - 重定向到关键词系统
 */
import { redirect } from 'next/navigation';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // 直接重定向到关键词系统首页
  redirect(`/${locale}/keywords`);
}
