// app/sitemap.ts
// 动态 Sitemap 生成 - 从数据源读取博客列表，避免硬编码维护
import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { blogPosts } from '@/config/blog-posts'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = siteConfig.url
    const locales = siteConfig.i18n.locales

    const result: MetadataRoute.Sitemap = []

    // 1. 首页（最高优先级）
    for (const locale of locales) {
        result.push({
            url: `${baseUrl}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        })
    }

    // 2. 核心产品页
    const corePages = [
        { path: 'create', priority: 0.95, changeFrequency: 'daily' as const },
        { path: 'pricing', priority: 0.85, changeFrequency: 'weekly' as const },
        { path: 'about', priority: 0.7, changeFrequency: 'monthly' as const },
    ]

    for (const locale of locales) {
        for (const page of corePages) {
            result.push({
                url: `${baseUrl}/${locale}/${page.path}`,
                lastModified: new Date(),
                changeFrequency: page.changeFrequency,
                priority: page.priority,
            })
        }
    }

    // 3. 博客列表页
    for (const locale of locales) {
        result.push({
            url: `${baseUrl}/${locale}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        })
    }

    // 4. 动态生成博客文章页（从 blogPosts 配置读取，无需硬编码）
    for (const locale of locales) {
        for (const post of blogPosts) {
            result.push({
                url: `${baseUrl}/${locale}/blog/${post.slug}`,
                lastModified: new Date(post.publishDate),
                changeFrequency: 'weekly',
                priority: 0.85,
            })
        }
    }

    // 5. 法律页面（低优先级）
    const legalPages = ['privacy', 'terms']
    for (const locale of locales) {
        for (const page of legalPages) {
            result.push({
                url: `${baseUrl}/${locale}/${page}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            })
        }
    }

    return result
}
