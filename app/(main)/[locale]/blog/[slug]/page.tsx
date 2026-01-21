import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Calendar, User, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { blogPosts, BlogPost } from '@/config/blog-posts';

// 静态页面 - 使用 generateStaticParams 预生成所有博客文章
export const dynamic = 'force-static';

// 从配置获取博客文章
function getPost(slug: string, locale: string): (BlogPost & {
    author: string;
    readTime: string;
    tags: string[];
    toc: { id: string; title: string }[];
}) | null {
    const post = blogPosts.find(p => p.slug === slug);
    if (!post) return null;

    const isZh = locale === 'zh';

    // 从内容中提取 h2 标题作为目录
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
    const toc: { id: string; title: string }[] = [];
    let match;
    while ((match = h2Regex.exec(post.content)) !== null) {
        const title = match[1].replace(/<[^>]*>/g, '').trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        toc.push({ id, title });
    }

    return {
        ...post,
        author: 'Flux.2 Klein Team',
        readTime: isZh ? '5 分钟阅读' : '5 min read',
        tags: post.keywords.slice(0, 3).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
        toc,
    };
}

// 获取相关文章
function getRelatedPosts(currentSlug: string, limit: number = 3) {
    return blogPosts
        .filter(p => p.slug !== currentSlug)
        .slice(0, limit)
        .map(p => ({
            slug: p.slug,
            title: p.title,
            date: p.publishDate,
        }));
}

export async function generateStaticParams() {
    return blogPosts.map(post => ({
        slug: post.slug,
    }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const post = getPost(params.slug, params.locale);
    if (!post) return {};

    return {
        title: `${post.title} | ${siteConfig.name}`,
        description: post.description,
        keywords: post.keywords,
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            publishedTime: post.publishDate,
            authors: [post.author],
            url: `${siteConfig.url}/${params.locale}/blog/${params.slug}`,
        },
        alternates: {
            canonical: `${siteConfig.url}/${params.locale}/blog/${params.slug}`,
            languages: {
                'en': `${siteConfig.url}/en/blog/${params.slug}`,
                'zh': `${siteConfig.url}/zh/blog/${params.slug}`,
                'x-default': `${siteConfig.url}/en/blog/${params.slug}`,
            },
        },
    };
}

// 处理内容：添加 id 到 h2 标签
function processContent(content: string): string {
    return content.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attrs, title) => {
        const cleanTitle = title.replace(/<[^>]*>/g, '').trim();
        const id = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `<h2 id="${id}"${attrs}>${title}</h2>`;
    });
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string; locale: string }> }) {
    const params = await props.params;
    const post = getPost(params.slug, params.locale);
    if (!post) return notFound();

    const isZh = params.locale === 'zh';
    const localePrefix = `/${params.locale}`;
    const relatedPosts = getRelatedPosts(params.slug);
    const processedContent = processContent(post.content);

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="container max-w-7xl mx-auto px-4 py-12">
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center text-sm text-slate-400 mb-8 overflow-x-auto whitespace-nowrap">
                    <Link href={localePrefix} className="hover:text-indigo-400 transition-colors">
                        {isZh ? '首页' : 'Home'}
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2 text-slate-600" />
                    <Link href={`${localePrefix}/blog`} className="hover:text-indigo-400 transition-colors">
                        {isZh ? '博客' : 'Blog'}
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2 text-slate-600" />
                    <span className="text-white font-medium truncate max-w-[200px] md:max-w-none">{post.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content Area (8/12) */}
                    <main className="lg:col-span-8">
                        {/* Article Header */}
                        <header className="mb-10">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-white">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-400 border-b border-slate-800 pb-8">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{post.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <time dateTime={post.publishDate}>{post.publishDate}</time>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{post.readTime}</span>
                                </div>
                            </div>
                        </header>

                        {/* Article Body (Prose Styling) */}
                        <article className="prose prose-invert prose-lg max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
              prose-p:text-slate-300
              prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-blockquote:border-indigo-500 prose-blockquote:bg-slate-800/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
              prose-li:text-slate-300
              prose-table:border-slate-700 prose-thead:border-slate-700 prose-tr:border-slate-700
              prose-th:text-white prose-th:bg-slate-800/50 prose-th:px-4 prose-th:py-2
              prose-td:px-4 prose-td:py-2 prose-td:text-slate-300
              prose-img:rounded-xl prose-img:shadow-lg">
                            <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                        </article>

                        {/* Bottom CTA Card */}
                        <div className="mt-16 p-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl border border-slate-700 text-center">
                            <h3 className="text-2xl font-bold mb-4 text-white">
                                {isZh ? '准备好创作惊艳的 AI 艺术了吗？' : 'Ready to Create Stunning AI Art?'}
                            </h3>
                            <p className="text-slate-400 mb-6">
                                {isZh
                                    ? '免费试用 Flux.2 [Klein] 图像生成器，新用户无需付费即可体验。'
                                    : 'Try our Flux.2 [Klein] powered generator for free. No credit card required for trial credits.'}
                            </p>
                            <Link href={`${localePrefix}/create`}>
                                <Button size="lg" className="rounded-full px-8 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/20">
                                    {isZh ? '免费试用 Flux.2 Klein' : 'Try Flux.2 Klein Free'} <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </main>

                    {/* Sidebar (4/12) */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Sticky Floating CTA (High Conversion Core) */}
                        <div className="sticky top-24 space-y-8">
                            <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-none text-white shadow-2xl overflow-hidden">
                                <CardContent className="p-6 relative">
                                    <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/30" />
                                    <div className="font-bold text-lg mb-2 opacity-90">Flux.2 [Klein] Generator</div>
                                    <h3 className="text-2xl font-extrabold mb-4 leading-snug">
                                        {isZh ? '每日 3 张免费生成' : 'Generate 3 Images for Free Daily'}
                                    </h3>
                                    <p className="text-indigo-100 text-sm mb-6">
                                        {isZh
                                            ? '立即体验最新智谱 AI 模型的强大能力。'
                                            : 'Experience the power of the latest Zhipu AI models instantly.'}
                                    </p>
                                    <Link href={`${localePrefix}/create`} className="block">
                                        <Button variant="secondary" className="w-full font-bold text-indigo-700 hover:bg-white/90">
                                            {isZh ? '立即开始生成' : 'Start Generating Now'}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Table of Contents */}
                            {post.toc.length > 0 && (
                                <div className="hidden lg:block bg-slate-800/30 rounded-xl p-6 border border-slate-700">
                                    <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4">
                                        {isZh ? '本文目录' : 'On this page'}
                                    </h4>
                                    <ul className="space-y-3 text-sm border-l-2 border-slate-700 pl-4">
                                        {post.toc.map((item, idx) => (
                                            <li key={item.id}>
                                                <a
                                                    href={`#${item.id}`}
                                                    className={`block transition-colors ${idx === 0 ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-indigo-400'}`}
                                                >
                                                    {item.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Related Articles */}
                            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
                                <h4 className="font-bold mb-4 text-white">{isZh ? '相关文章' : 'Related Articles'}</h4>
                                <ul className="space-y-4">
                                    {relatedPosts.map(related => (
                                        <li key={related.slug}>
                                            <Link href={`${localePrefix}/blog/${related.slug}`} className="group block">
                                                <span className="text-sm font-medium text-slate-300 group-hover:text-indigo-400 transition-colors line-clamp-2">
                                                    {related.title}
                                                </span>
                                                <span className="text-xs text-slate-500">{related.date}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Structured Data (SEO) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'BlogPosting',
                            headline: post.title,
                            datePublished: post.publishDate,
                            author: {
                                '@type': 'Person',
                                name: post.author,
                            },
                            description: post.description,
                            keywords: post.keywords.join(', '),
                            publisher: {
                                '@type': 'Organization',
                                name: siteConfig.name,
                                url: siteConfig.url,
                            },
                        }),
                    }}
                />
            </div>
        </div>
    );
}
