/** @type {import('next-sitemap').IConfig} */
// 注意：Sitemap 现在由 app/sitemap.ts 动态生成
// 此配置仅作为备用，主要用于 postbuild 脚本兼容
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://www.flux2klein.cc',
    generateRobotsTxt: false, // 由 app/robots.ts 生成
    generateIndexSitemap: false,

    // 排除不应被索引的页面
    exclude: [
        '/api/*',
        '/_next/*',
        '/server-sitemap.xml',
        '/icon.svg',
        '/apple-icon.png',
        '/robots.txt',
        '/*/sign-in',
        '/*/sign-up',
        '/*/forgot-password',
        '/*/dashboard',
    ],

    // 多语言链接
    alternateRefs: [
        {
            href: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.flux2klein.cc'}/en`,
            hreflang: 'en',
        },
        {
            href: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.flux2klein.cc'}/zh`,
            hreflang: 'zh',
        },
    ],

    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/_next/',
                    '/*/sign-in',
                    '/*/sign-up',
                    '/*/forgot-password',
                    '/*/dashboard',
                ],
            },
        ],
    },
};
