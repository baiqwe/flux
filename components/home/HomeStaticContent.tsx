import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Sparkles, Lock, Zap, Palette, Smartphone, Printer, Users, GraduationCap, Camera, Heart, ArrowRight, Star } from 'lucide-react';

interface HomeStaticContentProps {
    locale: string;
}

export default async function HomeStaticContent({ locale }: HomeStaticContentProps) {
    const tHome = await getTranslations({ locale, namespace: 'home' });
    const tFeatures = await getTranslations({ locale, namespace: 'features' });

    return (
        <div className="bg-slate-950">
            {/* What Section */}
            <WhatSection t={tHome} />

            {/* How Section */}
            <HowSection t={tHome} />

            {/* Comparison Table - High SEO Weight */}
            <ComparisonSection t={tHome} />

            {/* Features Section */}
            <FeaturesSection t={tFeatures} />

            {/* SEO Content Section */}
            <SEOContentSection t={tHome} />

            {/* FAQ Section */}
            <FAQSection t={tHome} />

            {/* CTA Section */}
            <CTASection t={tHome} locale={locale} />
        </div>
    );
}

function WhatSection({ t }: { t: any }) {
    return (
        <section className="py-20 bg-slate-900/50">
            <div className="container px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            {t('what.title')}
                        </h2>
                        <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            {t('what.desc')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-indigo-500/50 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                                <Palette className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">
                                {t('what.feature_1_title')}
                            </h3>
                            <p className="text-slate-400">
                                {t('what.feature_1_desc')}
                            </p>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-indigo-500/50 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                                <Heart className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">
                                {t('what.feature_2_title')}
                            </h3>
                            <p className="text-slate-400">
                                {t('what.feature_2_desc')}
                            </p>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-indigo-500/50 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                                <Sparkles className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">
                                {t('what.feature_3_title')}
                            </h3>
                            <p className="text-slate-400">
                                {t('what.feature_3_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function HowSection({ t }: { t: any }) {
    const steps = [
        { number: 1, title: t('how.step_1_title'), desc: t('how.step_1_desc') },
        { number: 2, title: t('how.step_2_title'), desc: t('how.step_2_desc') },
        { number: 3, title: t('how.step_3_title'), desc: t('how.step_3_desc') },
        { number: 4, title: t('how.step_4_title'), desc: t('how.step_4_desc') },
    ];

    return (
        <section className="py-20 bg-slate-950">
            <div className="container px-4 md:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            {t('how.title')}
                        </h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            {t('how.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {steps.map((step) => (
                            <div key={step.number} className="relative">
                                <div className="text-center space-y-4">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold shadow-lg shadow-indigo-500/25">
                                        {step.number}
                                    </div>
                                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                                    <p className="text-sm text-slate-400">{step.desc}</p>
                                </div>
                                {step.number < steps.length && (
                                    <div className="hidden md:flex absolute top-8 left-full w-8 -translate-y-1/2 items-center justify-center z-10">
                                        <ArrowRight className="w-6 h-6 text-slate-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// 高权重 SEO 内容 - Flux.2 Klein vs Flux.1 Dev 对比表格
function ComparisonSection({ t }: { t: any }) {
    return (
        <section className="py-20 bg-slate-900/50">
            <div className="container px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            {t('comparison.title')}
                        </h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            {t('comparison.subtitle')}
                        </p>
                    </div>

                    {/* Comparison Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="p-4 text-left text-slate-400 font-medium">{t('comparison.feature')}</th>
                                    <th className="p-4 text-center text-indigo-400 font-bold">{t('comparison.klein')}</th>
                                    <th className="p-4 text-center text-slate-400 font-medium">{t('comparison.dev')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-700/50">
                                    <td className="p-4 text-slate-300">{t('comparison.model_size')}</td>
                                    <td className="p-4 text-center text-indigo-300 font-bold">{t('comparison.klein_size')}</td>
                                    <td className="p-4 text-center text-slate-400">{t('comparison.dev_size')}</td>
                                </tr>
                                <tr className="border-b border-slate-700/50">
                                    <td className="p-4 text-slate-300">{t('comparison.speed')}</td>
                                    <td className="p-4 text-center text-green-400 font-bold">{t('comparison.klein_speed')}</td>
                                    <td className="p-4 text-center text-slate-400">{t('comparison.dev_speed')}</td>
                                </tr>
                                <tr className="border-b border-slate-700/50">
                                    <td className="p-4 text-slate-300">{t('comparison.vram')}</td>
                                    <td className="p-4 text-center text-green-400 font-bold">{t('comparison.klein_vram')}</td>
                                    <td className="p-4 text-center text-slate-400">{t('comparison.dev_vram')}</td>
                                </tr>
                                <tr>
                                    <td className="p-4 text-slate-300">{t('comparison.best_for')}</td>
                                    <td className="p-4 text-center text-indigo-300 font-bold">{t('comparison.klein_best')}</td>
                                    <td className="p-4 text-center text-slate-400">{t('comparison.dev_best')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeaturesSection({ t }: { t: any }) {
    const features = [
        { icon: Lock, title: t('feature_1_title'), desc: t('feature_1_desc'), color: 'indigo' },
        { icon: Zap, title: t('feature_2_title'), desc: t('feature_2_desc'), color: 'yellow' },
        { icon: Palette, title: t('feature_3_title'), desc: t('feature_3_desc'), color: 'purple' },
        { icon: Sparkles, title: t('feature_4_title'), desc: t('feature_4_desc'), color: 'pink' },
        { icon: Smartphone, title: t('feature_5_title'), desc: t('feature_5_desc'), color: 'cyan' },
        { icon: Printer, title: t('feature_6_title'), desc: t('feature_6_desc'), color: 'emerald' },
    ];

    const colorMap: Record<string, string> = {
        indigo: 'bg-indigo-500/20 text-indigo-400',
        yellow: 'bg-yellow-500/20 text-yellow-400',
        purple: 'bg-purple-500/20 text-purple-400',
        pink: 'bg-pink-500/20 text-pink-400',
        cyan: 'bg-cyan-500/20 text-cyan-400',
        emerald: 'bg-emerald-500/20 text-emerald-400',
    };

    return (
        <section className="py-20 bg-slate-900/50">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-6xl space-y-12 text-center">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            {t('title')}
                        </h2>
                        <p className="mx-auto max-w-3xl text-slate-400 text-lg">
                            {t('subtitle')}
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-xl bg-slate-800/50 p-6 border border-slate-700 hover:border-indigo-500/50 transition-all hover:transform hover:-translate-y-1"
                                >
                                    <div className="space-y-4">
                                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${colorMap[feature.color]}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                                        <p className="text-slate-400">{feature.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FAQSection({ t }: { t: any }) {
    const faqs = [
        { q: t('faq.q1'), a: t('faq.a1') },
        { q: t('faq.q2'), a: t('faq.a2') },
        { q: t('faq.q3'), a: t('faq.a3') },
        { q: t('faq.q4'), a: t('faq.a4') },
    ];

    return (
        <section className="py-20 bg-slate-950 border-t border-slate-800">
            <div className="container px-4 md:px-6">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            {t('faq.title')}
                        </h2>
                        <p className="text-lg text-slate-400">
                            {t('faq.subtitle')}
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                <h3 className="text-xl font-bold text-white mb-3">{faq.q}</h3>
                                <div className="text-slate-400 whitespace-pre-line leading-relaxed">
                                    {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function CTASection({ t, locale }: { t: any; locale: string }) {
    const localePrefix = `/${locale}`;

    return (
        <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-4xl text-center space-y-8">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 text-sm">
                            <Star className="w-4 h-4" />
                            {locale === 'zh' ? '免费试用' : 'Free to Try'}
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            {t('cta.title')}
                        </h2>
                        <p className="mx-auto max-w-2xl text-slate-400 text-lg">
                            {t('cta.subtitle')}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Link
                                href={localePrefix}
                                className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all font-medium text-lg shadow-lg shadow-indigo-500/25"
                            >
                                {t('cta.button_start')}
                            </Link>
                            <Link
                                href={`${localePrefix}/pricing`}
                                className="px-8 py-4 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors font-medium text-lg border border-slate-700"
                            >
                                {t('cta.button_coloring')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SEOContentSection({ t }: { t: any }) {
    return (
        <section className="py-20 bg-slate-900 border-t border-slate-800">
            <div className="container px-4 md:px-6 max-w-4xl mx-auto prose prose-invert prose-lg">
                {/* Comparison Table */}
                <h2 className="text-3xl font-bold text-white mb-8">{t('seo.comparison_title')}</h2>
                <p className="text-slate-400 mb-8">{t('seo.comparison_intro')}</p>

                <div className="not-prose grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <div className="text-2xl mb-2">🇨🇳</div>
                        <h3 className="font-bold text-white mb-2">{t('seo.compare_chinese')}</h3>
                        <p className="text-sm text-slate-400">{t('seo.compare_chinese_desc')}</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <div className="text-2xl mb-2">⚡️</div>
                        <h3 className="font-bold text-white mb-2">{t('seo.compare_speed')}</h3>
                        <p className="text-sm text-slate-400">{t('seo.compare_speed_desc')}</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <div className="text-2xl mb-2">💰</div>
                        <h3 className="font-bold text-white mb-2">{t('seo.compare_price')}</h3>
                        <p className="text-sm text-slate-400">{t('seo.compare_price_desc')}</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <div className="text-2xl mb-2">🚀</div>
                        <h3 className="font-bold text-white mb-2">{t('seo.compare_queue')}</h3>
                        <p className="text-sm text-slate-400">{t('seo.compare_queue_desc')}</p>
                    </div>
                </div>

                {/* Video Tutorial (Schema-ready) */}
                <h2 className="text-3xl font-bold text-white mt-16 mb-6">{t('seo.video_title')}</h2>
                <p className="text-slate-400 mb-8">{t('seo.video_intro')}</p>
                <div className="space-y-6 mb-16">
                    <div className="flex gap-4">
                        <div className="flex-none w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">1</div>
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-1">{t('seo.video_step_1')}</h3>
                            <p className="text-slate-400">{t('seo.video_step_1_desc')}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-none w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">2</div>
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-1">{t('seo.video_step_2')}</h3>
                            <p className="text-slate-400">{t('seo.video_step_2_desc')}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-none w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">3</div>
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-1">{t('seo.video_step_3')}</h3>
                            <p className="text-slate-400">{t('seo.video_step_3_desc')}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-none w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">4</div>
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-1">{t('seo.video_step_4')}</h3>
                            <p className="text-slate-400">{t('seo.video_step_4_desc')}</p>
                        </div>
                    </div>
                </div>

                {/* Tech Specs */}
                <div className="bg-slate-800/30 p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">{t('seo.tech_title')}</h2>
                    <p className="text-slate-300 mb-6">{t('seo.tech_intro')}</p>
                    <ul className="space-y-4 list-none pl-0">
                        <li className="flex gap-3">
                            <span className="text-indigo-400">❖</span>
                            <span><strong className="text-white">{t('seo.tech_feature_1')}:</strong> {t('seo.tech_feature_1_desc')}</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-indigo-400">❖</span>
                            <span><strong className="text-white">{t('seo.tech_feature_2')}:</strong> {t('seo.tech_feature_2_desc')}</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-indigo-400">❖</span>
                            <span><strong className="text-white">{t('seo.tech_feature_3')}:</strong> {t('seo.tech_feature_3_desc')}</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-indigo-400">❖</span>
                            <span><strong className="text-white">{t('seo.tech_feature_4')}:</strong> {t('seo.tech_feature_4_desc')}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
