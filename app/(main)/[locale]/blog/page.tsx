import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Calendar, Clock, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { blogPosts } from '@/config/blog-posts';

// 静态页面 - 启用 CDN 缓存
export const dynamic = 'force-static';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';

    return {
        title: isZh ? `博客 - ${siteConfig.name}` : `Blog - ${siteConfig.name}`,
        description: isZh
            ? `${siteConfig.name} 博客 - AI 图像生成教程、技巧和最新动态`
            : `${siteConfig.name} Blog - AI image generation tutorials, tips, and latest updates`,
        alternates: {
            canonical: `${siteConfig.url}/${locale}/blog`,
            languages: {
                'en': `${siteConfig.url}/en/blog`,
                'zh': `${siteConfig.url}/zh/blog`,
                'x-default': `${siteConfig.url}/en/blog`,
            },
        },
    };
}

// 从配置获取博客列表
function getPosts(locale: string) {
    const isZh = locale === 'zh';
    return blogPosts.map(post => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.description,
        date: post.publishDate,
        readTime: isZh ? '5 分钟' : '5 min',
        tags: post.keywords.slice(0, 2).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    }));
}

export default async function BlogPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const isZh = locale === 'zh';
    const localePrefix = `/${locale}`;
    const posts = getPosts(locale);

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="container max-w-6xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 text-sm mb-6">
                        <Sparkles className="w-4 h-4" />
                        {isZh ? 'AI 图像生成博客' : 'AI Image Generation Blog'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {isZh ? '博客' : 'Blog'}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        {isZh
                            ? '探索 AI 图像生成的技巧、教程和最新动态'
                            : 'Explore tips, tutorials, and the latest in AI image generation'}
                    </p>
                </div>

                {/* Posts Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {posts.map(post => (
                        <Link key={post.slug} href={`${localePrefix}/blog/${post.slug}`} className="group">
                            <Card className="h-full bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10">
                                <CardContent className="p-6">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {post.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="bg-indigo-500/20 text-indigo-300">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-slate-400 mb-4 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {post.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {post.readTime}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="text-center p-12 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {isZh ? '准备好开始创作了吗？' : 'Ready to Start Creating?'}
                    </h2>
                    <p className="text-slate-400 mb-6 max-w-xl mx-auto">
                        {isZh
                            ? '无需等待，立即使用 Flux.2 [Klein] 生成您的第一张 AI 图像。'
                            : 'No waiting needed. Generate your first AI image with Flux.2 [Klein] right now.'}
                    </p>
                    <Link href={`${localePrefix}/create`}>
                        <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                            {isZh ? '免费开始生成' : 'Start Generating Free'} <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
