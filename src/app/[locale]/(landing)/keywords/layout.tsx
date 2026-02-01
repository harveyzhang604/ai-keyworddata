/**
 * 关键词系统专用布局
 * 隐藏模板的导航栏，使用简化的头部
 */
import { ReactNode } from 'react';
import Link from 'next/link';
import { DatabaseIcon } from 'lucide-react';

export default function KeywordsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 简化的头部 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/keywords" className="flex items-center gap-2 font-bold text-lg">
            <DatabaseIcon className="h-6 w-6" />
            <span>AI 关键词挖掘系统</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/keywords/dashboard" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              数据看板
            </Link>
            <Link 
              href="/keywords/list" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              关键词列表
            </Link>
            <Link 
              href="/keywords/reports" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              分析报告
            </Link>
            <Link 
              href="/keywords/trends" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              趋势分析
            </Link>
            <Link 
              href="/keywords/api-keys" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              API Keys
            </Link>
            <Link 
              href="/keywords/api-docs" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              API 文档
            </Link>
          </nav>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 简化的页脚 */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex h-16 items-center justify-between text-sm text-muted-foreground">
          <p>© 2026 AI 关键词挖掘系统. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/keywords" className="hover:text-primary">
              首页
            </Link>
            <Link href="/keywords/api-docs" className="hover:text-primary">
              API 文档
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
