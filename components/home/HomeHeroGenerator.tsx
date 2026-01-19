'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Wand2, Download, VideoIcon, Dices } from 'lucide-react';
import Image from 'next/image';
import { QuickRefillModal } from '@/components/payment/quick-refill-modal';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/use-credits';
import { createClient } from '@/utils/supabase/client';

// 风格选项
const STYLES = [
    { id: "default", name: "Auto", nameZh: "自动", icon: "✨" },
    { id: "photo", name: "Photo", nameZh: "写实", icon: "📷" },
    { id: "art", name: "Art", nameZh: "艺术", icon: "🎨" },
    { id: "anime", name: "Anime", nameZh: "动漫", icon: "🌸" },
    { id: "cinematic", name: "Cinema", nameZh: "电影", icon: "🎬" },
];

// 宽高比选项
const ASPECT_RATIOS = [
    { id: "1:1", icon: "□" },
    { id: "16:9", icon: "▭" },
    { id: "3:2", icon: "▭" },
    { id: "2:3", icon: "▯" },
    { id: "3:4", icon: "▯" },
    { id: "4:3", icon: "▭" },
    { id: "9:16", icon: "▯" },
];

// 灵感画廊 - Flux.2 Klein 高质量提示词示例
const INSPIRATION_PROMPTS = [
    {
        id: "cyber-city",
        prompt: "A futuristic cyberpunk city at night, towering skyscrapers with neon signs, flying cars leaving light trails, rain-soaked streets reflecting colorful lights, cinematic atmosphere, 8K ultra detailed",
        promptZh: "未来赛博朋克城市夜景，高耸入云的摩天大楼霓虹招牌，飞行汽车留下光迹，雨后街道倒映五彩灯光，电影氛围",
        label: "🌃 Cyberpunk",
        labelZh: "🌃 赛博朋克"
    },
    {
        id: "anime-girl",
        prompt: "Beautiful anime girl with flowing white hair, sakura petals dancing around her, soft sunset lighting, delicate features, Studio Ghibli inspired, dreamy atmosphere, highly detailed",
        promptZh: "飘逸白发的美丽动漫少女，樱花花瓣在她周围飞舞，柔和的日落光线，精致五官，吉卜力风格，梦幻氛围",
        label: "🌸 Anime",
        labelZh: "🌸 动漫少女"
    },
    {
        id: "photo-portrait",
        prompt: "Professional fashion photography, young woman in minimalist white studio, dramatic side lighting, haute couture outfit, editorial style, shot on medium format camera, sharp focus",
        promptZh: "专业时尚摄影，极简白色工作室中的年轻女性，戏剧性侧光，高级定制时装，编辑风格，中画幅相机质感",
        label: "📸 Portrait",
        labelZh: "📸 时尚写真"
    },
    {
        id: "landscape",
        prompt: "Majestic mountain landscape at golden hour, snow-capped peaks reflecting in crystal clear alpine lake, dramatic clouds, nature photography, National Geographic style, breathtaking scenery",
        promptZh: "壮丽的黄金时刻山景，白雪皑皑的山峰倒映在清澈的高山湖泊中，戏剧性云层，自然摄影，国家地理风格",
        label: "🏔️ Landscape",
        labelZh: "🏔️ 风景大片"
    }
];

interface HomeHeroGeneratorProps {
    onShowStaticContent: (show: boolean) => void;
    user?: any;
}

export default function HomeHeroGenerator({ onShowStaticContent, user }: HomeHeroGeneratorProps) {
    const t = useTranslations('hero');
    const tCreate = useTranslations('create');
    const pathname = usePathname();
    const locale = pathname?.split('/')[1] === 'zh' ? 'zh' : 'en';

    const { credits, refetchCredits } = useCredits();
    const { toast } = useToast();

    const [prompt, setPrompt] = useState("A futuristic cyberpunk city at night, neon lights reflecting on wet streets, flying cars, cinematic atmosphere, ultra detailed, 8K");
    const [selectedStyle, setSelectedStyle] = useState("default");
    const [selectedRatio, setSelectedRatio] = useState("1:1");
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    // 已移除: enhancedPrompt 和 enableEnhance (裸模型直出方案)

    // 客户端用户状态 - 优先使用客户端实时获取的用户状态
    const [currentUser, setCurrentUser] = useState<any>(user);

    // 组件挂载时检查最新的登录状态，解决登录后页面不刷新导致 user prop 过期的问题
    useEffect(() => {
        const checkUser = async () => {
            try {
                const supabase = createClient();
                const { data: { user: latestUser } } = await supabase.auth.getUser();
                if (latestUser) {
                    setCurrentUser(latestUser);
                    setShowLoginPrompt(false); // 如果已登录，隐藏登录提示
                }
            } catch (error) {
                console.error('Error checking user:', error);
            }
        };

        checkUser();

        // 监听 auth 状态变化
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setCurrentUser(session.user);
                setShowLoginPrompt(false);
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // 当有结果图时，隐藏静态内容
    useEffect(() => {
        onShowStaticContent(!resultImage);
    }, [resultImage, onShowStaticContent]);

    const saveStateForLater = () => {
        localStorage.setItem("pending_flux_generation", JSON.stringify({
            prompt, selectedStyle, selectedRatio, timestamp: Date.now()
        }));
    };

    const handleGenerate = async (force = false) => {
        if (!prompt.trim()) {
            setError(locale === "zh" ? "请输入描述" : "Please enter a prompt");
            return;
        }

        if (!currentUser) {
            saveStateForLater();
            setShowLoginPrompt(true);
            return;
        }

        if (!force && credits && credits.remaining_credits < 10) {
            saveStateForLater();
            setIsRefillModalOpen(true);
            return;
        }

        setIsGenerating(true);
        setError(null);
        setShowLoginPrompt(false);

        try {
            const response = await fetch("/api/ai/text-to-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    aspect_ratio: selectedRatio,
                    style: selectedStyle,
                    // enhance 已禁用 - 裸模型直出
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 402) {
                    saveStateForLater();
                    setIsRefillModalOpen(true);
                    return;
                }
                if (response.status === 401) {
                    saveStateForLater();
                    setShowLoginPrompt(true);
                    return;
                }
                throw new Error(errorData.error || "Generation failed");
            }

            const data = await response.json();
            if (data.url) {
                setResultImage(data.url);
                // 裸模型直出 - 不再处理 enhancedPrompt
                await refetchCredits();
                const confetti = (await import('canvas-confetti')).default;
                confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!resultImage) return;
        try {
            const response = await fetch(resultImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `flux-klein-${Date.now()}.webp`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch {
            window.open(resultImage, '_blank');
        }
    };

    return (
        <>
            <QuickRefillModal isOpen={isRefillModalOpen} onClose={() => setIsRefillModalOpen(false)} />

            {/* Hero Section with Background */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                {/* Animated Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

                {/* Gradient Orbs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

                <div className="container relative z-10 px-4 py-12 md:py-16">
                    {/* Title */}
                    <div className="text-center mb-8 md:mb-12">
                        <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm bg-indigo-500/20 text-indigo-300 mb-6 border border-indigo-500/30">
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t('badge')}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Flux.2 [Klein]
                            </span>
                            <span className="text-white/90 block mt-2 text-2xl md:text-3xl lg:text-4xl font-medium">
                                {locale === 'zh' ? '在线生成器' : 'Online Generator'}
                            </span>
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Generator UI */}
                    <div className="max-w-5xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                            {/* Left: Input Controls */}
                            <div className="space-y-5 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
                                {/* Prompt */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        {locale === 'zh' ? '你的提示词' : 'Your Prompt'}
                                    </label>
                                    <Textarea
                                        placeholder={locale === 'zh'
                                            ? "描述你想要的画面，例如：王家卫电影风格，孤独的香港街道里独自吸烟的男人，1998 年代..."
                                            : "Describe the image you want, e.g.: A serene Japanese garden with cherry blossoms..."}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        className="min-h-[120px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none focus:border-indigo-500 focus:ring-indigo-500/20"
                                        maxLength={2000}
                                    />

                                    {/* 提示词长度建议 */}
                                    <p className="text-xs text-slate-500 mt-1.5">
                                        {locale === 'zh'
                                            ? '💡 为保证文字生成效果，请控制提示词在 80 字内'
                                            : '💡 For best text rendering, keep prompts under 80 characters'}
                                    </p>

                                    {/* 灵感快捷按钮 */}
                                    <div className="flex items-center justify-between mt-3 gap-2">
                                        {/* 灵感快捷按钮 */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {INSPIRATION_PROMPTS.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setPrompt(locale === 'zh' ? item.promptZh : item.prompt)}
                                                    className="px-2 py-1 text-xs rounded-md bg-slate-800 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all border border-slate-700 hover:border-indigo-500/30"
                                                >
                                                    {locale === 'zh' ? item.labelZh : item.label}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const random = INSPIRATION_PROMPTS[Math.floor(Math.random() * INSPIRATION_PROMPTS.length)];
                                                    setPrompt(locale === 'zh' ? random.promptZh : random.prompt);
                                                }}
                                                className="px-2 py-1 text-xs rounded-md bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all border border-purple-500/30"
                                                title={locale === 'zh' ? '随机灵感' : 'Random inspiration'}
                                            >
                                                <Dices className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Aspect Ratio */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">Aspect Ratio</label>
                                    <div className="flex flex-wrap gap-2">
                                        {ASPECT_RATIOS.map((ratio) => (
                                            <button
                                                key={ratio.id}
                                                onClick={() => setSelectedRatio(ratio.id)}
                                                className={`px-3 py-2 rounded-lg text-sm font-mono transition-all ${selectedRatio === ratio.id
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                                    }`}
                                            >
                                                {ratio.id}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Style */}
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        {locale === 'zh' ? '风格' : 'Style'}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {STYLES.map((style) => (
                                            <button
                                                key={style.id}
                                                onClick={() => setSelectedStyle(style.id)}
                                                className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5 ${selectedStyle === style.id
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                                    }`}
                                            >
                                                <span>{style.icon}</span>
                                                <span>{locale === 'zh' ? style.nameZh : style.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Credits Info */}
                                {currentUser ? (
                                    <div className="flex items-center justify-between text-sm text-slate-400 bg-slate-800/50 px-4 py-3 rounded-lg">
                                        <span>{locale === 'zh' ? '剩余积分' : 'Credits'}</span>
                                        <span className="font-bold text-white">{credits?.remaining_credits ?? 0}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-indigo-300 bg-indigo-500/10 px-4 py-3 rounded-lg border border-indigo-500/20">
                                        <Sparkles className="w-4 h-4" />
                                        {locale === 'zh' ? '新用户免费获得 3 次生成！' : 'New users get 3 free generations!'}
                                    </div>
                                )}

                                {/* Generate Button */}
                                <div className="space-y-2">
                                    <Button
                                        size="lg"
                                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                                        onClick={() => handleGenerate()}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                {locale === 'zh' ? 'AI 正在创作...' : 'AI is creating...'}
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="mr-2 h-5 w-5" />
                                                {locale === 'zh' ? '生成图片' : 'Generate'}
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-xs text-slate-500">
                                        {locale === 'zh' ? '每次生成消耗 10 积分' : '10 credits per generation'}
                                    </p>
                                </div>

                                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                                {showLoginPrompt && !currentUser && (
                                    <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <p className="text-slate-300 text-sm mb-3">
                                            {locale === 'zh' ? '登录后免费试用 3 次' : 'Sign in to get 3 free generations'}
                                        </p>
                                        <Button
                                            onClick={() => window.location.href = `/${locale}/sign-in`}
                                            variant="outline"
                                            className="border-indigo-500 text-indigo-400 hover:bg-indigo-500/10"
                                        >
                                            {locale === 'zh' ? '登录 / 注册' : 'Sign In / Sign Up'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Right: Result Preview */}
                            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800 flex flex-col">
                                <div className="flex-1 flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
                                    {resultImage ? (
                                        <div className="space-y-4 w-full">
                                            <div className="relative aspect-square max-h-[400px] w-full rounded-xl overflow-hidden border border-slate-700">
                                                <Image
                                                    src={resultImage}
                                                    alt="Generated by Flux.2 Klein"
                                                    fill
                                                    className="object-contain"
                                                    unoptimized  // 跳过 Next.js 图片优化，直接加载外部 URL
                                                />
                                            </div>

                                            <div className="flex gap-2 justify-center">
                                                <Button onClick={handleDownload} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    {locale === 'zh' ? '下载' : 'Download'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => { setResultImage(null); setPrompt(""); }}
                                                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                                                >
                                                    {locale === 'zh' ? '新建' : 'New'}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : isGenerating ? (
                                        <div className="flex flex-col items-center gap-4 text-slate-400">
                                            <div className="relative">
                                                <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
                                                <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                                            </div>
                                            <span>{locale === 'zh' ? '正在生成...' : 'Generating...'}</span>
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-500 space-y-3">
                                            <div className="text-5xl opacity-50">🎨</div>
                                            <p>{locale === 'zh' ? '生成的图片会显示在这里' : 'Generated image will appear here'}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Coming Soon: Video */}
                                <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 flex items-center gap-3">
                                    <VideoIcon className="w-5 h-5 text-purple-400" />
                                    <div className="flex-1">
                                        <span className="text-slate-300 text-sm font-medium">
                                            {locale === 'zh' ? '图生视频' : 'Image to Video'}
                                        </span>
                                        <span className="ml-2 text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full">
                                            {locale === 'zh' ? '即将上线' : 'Coming Soon'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom info */}
                        <p className="text-center text-slate-600 text-xs mt-6">
                            Powered by Flux.2 [Klein] • Black Forest Labs
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
