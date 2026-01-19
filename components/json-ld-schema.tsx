/**
 * JSON-LD Structured Data for WebApplication
 * Helps search engines understand FluxKlein as a web application
 * 
 * Note: This is a server component to avoid hydration issues
 */
import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/config/site';

export async function SoftwareApplicationSchema({ locale }: { locale: string }) {
    const t = await getTranslations({ locale, namespace: 'metadata' });

    const schema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": `${siteConfig.name} - Flux.2 [Klein] Online Generator`,
        "description": t('description'),
        "applicationCategory": "AI Image Generator",
        "operatingSystem": "Web Browser",
        "alternateName": [
            "Flux 2 Klein",
            "Flux.2 Klein Generator",
            "Flux Klein Online",
            "Black Forest Labs Flux"
        ],
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "3 free generations for new users"
        },
        "featureList": [
            "Flux.2 [Klein] 4B parameter model",
            "2x faster generation than larger models",
            "No GPU required - run in browser",
            "Multiple aspect ratios (1:1, 16:9, 9:16)",
            "Multiple style presets",
            "No ComfyUI setup needed",
            "Apache 2.0 licensed model"
        ],
        "screenshot": `${siteConfig.url}/og-image.png`,
        "url": siteConfig.url,
        "provider": {
            "@type": "Organization",
            "name": siteConfig.name,
            "url": siteConfig.url
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
