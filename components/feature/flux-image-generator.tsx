"use client";

import { useState, useEffect } from "react";
import { useCredits } from "@/hooks/use-credits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Wand2, Download, VideoIcon } from "lucide-react";
import Image from "next/image";
import { QuickRefillModal } from "@/components/payment/quick-refill-modal";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

// Style presets
const STYLES = [
    {
        id: "default",
        name: "High Quality",
        description: "Detailed, professional output",
        icon: "✨"
    },
    {
        id: "photo",
        name: "Photorealistic",
        description: "Natural photography style",
        icon: "📷"
    },
    {
        id: "art",
        name: "Digital Art",
        description: "Vibrant illustration style",
        icon: "🎨"
    },
    {
        id: "anime",
        name: "Anime",
        description: "Japanese anime aesthetic",
        icon: "🌸"
    },
    {
        id: "cinematic",
        name: "Cinematic",
        description: "Movie-like dramatic visuals",
        icon: "🎬"
    }
];

// Aspect ratio options
const ASPECT_RATIOS = [
    { id: "1:1", name: "Square", desc: "1:1", icon: "⬜" },
    { id: "16:9", name: "Landscape", desc: "16:9", icon: "🖼️" },
    { id: "9:16", name: "Portrait", desc: "9:16", icon: "📱" },
    { id: "4:3", name: "Standard", desc: "4:3", icon: "🖥️" },
];

interface FluxImageGeneratorProps {
    user: any;
    locale?: string;
    t?: any; // translations
}

export default function FluxImageGenerator({ user, locale = "en", t }: FluxImageGeneratorProps) {
    const { credits, refetchCredits } = useCredits();
    const { toast } = useToast();

    const [prompt, setPrompt] = useState("");
    const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
    const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0].id);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Payment Modal State
    const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);

    // Auth Modal State (for login interception)
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Check for payment success and restore state
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get("checkout") === "success") {
            const savedState = localStorage.getItem("pending_flux_generation");
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    setPrompt(parsed.prompt || "");
                    setSelectedStyle(parsed.selectedStyle || STYLES[0].id);
                    setSelectedRatio(parsed.selectedRatio || ASPECT_RATIOS[0].id);

                    localStorage.removeItem("pending_flux_generation");

                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 }
                    });

                    toast({
                        title: locale === "zh" ? "支付成功！" : "Payment Successful!",
                        description: locale === "zh"
                            ? "积分已添加，继续您的创作..."
                            : "Credits added. Resuming your creation...",
                        className: "bg-green-500 text-white border-none"
                    });

                    // Auto-trigger generation
                    setTimeout(() => {
                        handleGenerate(true);
                    }, 1000);
                } catch (e) {
                    console.error("Failed to restore state", e);
                }
            } else {
                toast({
                    title: locale === "zh" ? "欢迎回来！" : "Welcome Back!",
                    description: locale === "zh"
                        ? "您的积分已充值。"
                        : "Your credits have been topped up.",
                });
            }

            refetchCredits();
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Check for pending generation after login
        const pendingAfterLogin = localStorage.getItem("pending_flux_generation");
        if (user && pendingAfterLogin) {
            try {
                const parsed = JSON.parse(pendingAfterLogin);
                // Check if not expired (30 minutes)
                if (parsed.timestamp && Date.now() - parsed.timestamp < 30 * 60 * 1000) {
                    setPrompt(parsed.prompt || "");
                    setSelectedStyle(parsed.selectedStyle || STYLES[0].id);
                    setSelectedRatio(parsed.selectedRatio || ASPECT_RATIOS[0].id);
                    localStorage.removeItem("pending_flux_generation");

                    toast({
                        title: locale === "zh" ? "欢迎！" : "Welcome!",
                        description: locale === "zh"
                            ? "您的创作已恢复，点击生成开始。"
                            : "Your creation is restored. Click generate to start.",
                    });
                }
            } catch (e) {
                localStorage.removeItem("pending_flux_generation");
            }
        }
    }, [user]);

    const saveStateForLater = () => {
        localStorage.setItem("pending_flux_generation", JSON.stringify({
            prompt,
            selectedStyle,
            selectedRatio,
            timestamp: Date.now()
        }));
    };

    const handleGenerate = async (force = false) => {
        // Validate prompt
        if (!prompt.trim()) {
            setError(locale === "zh" ? "请输入描述" : "Please enter a prompt");
            return;
        }

        // Login interception
        if (!user) {
            saveStateForLater();
            setShowLoginPrompt(true);
            return;
        }

        // Check credits (unless forced after payment)
        if (!force && credits && credits.remaining_credits < 10) {
            saveStateForLater();
            setIsRefillModalOpen(true);
            return;
        }

        setIsGenerating(true);
        setError(null);
        setShowLoginPrompt(false);

        try {
            console.log("Calling Flux API...");

            const response = await fetch("/api/ai/text-to-image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    aspect_ratio: selectedRatio,
                    style: selectedStyle,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Intercept 402 Insufficient Funds
                if (response.status === 402) {
                    saveStateForLater();
                    setIsRefillModalOpen(true);
                    return;
                }

                // Intercept 401 Unauthorized
                if (response.status === 401) {
                    saveStateForLater();
                    setShowLoginPrompt(true);
                    return;
                }

                const errorMsg = errorData.details
                    ? `${errorData.error}: ${errorData.details}`
                    : (errorData.error || "Generation failed");
                throw new Error(errorMsg);
            }

            const data = await response.json();
            console.log("Generation success:", data);

            if (data.url) {
                setResultImage(data.url);
                await refetchCredits();

                // Celebration on success
                confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { y: 0.7 }
                });
            } else {
                throw new Error("No image returned from server");
            }

        } catch (err: any) {
            console.error("Generation error:", err);
            if (!isRefillModalOpen && !showLoginPrompt) {
                setError(err instanceof Error ? err.message : "Failed to generate");
            }
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
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Download failed:", e);
            // Fallback: open in new tab
            window.open(resultImage, '_blank');
        }
    };

    return (
        <div className="container py-8 px-4 max-w-7xl mx-auto">
            <QuickRefillModal
                isOpen={isRefillModalOpen}
                onClose={() => setIsRefillModalOpen(false)}
            />

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column: Input */}
                <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            🚀 {locale === "zh" ? "Flux.2 [Klein] 图像生成器" : "Flux.2 [Klein] Image Generator"}
                        </h1>
                        <p className="text-muted-foreground">
                            {locale === "zh"
                                ? "描述您想要创建的图像"
                                : "Describe the image you want to create"}
                        </p>
                    </div>

                    {/* Prompt Input - Main Area */}
                    <Card className="p-6 space-y-4 border-2 border-primary/20">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            {locale === "zh" ? "您的创意描述" : "Your Creative Prompt"}
                        </h3>
                        <Textarea
                            placeholder={locale === "zh"
                                ? "一个宁静的日式花园，樱花盛开，锦鲤池塘，日落时分的传统拱桥..."
                                : "A serene Japanese garden with cherry blossoms, koi pond, and traditional bridge at sunset..."}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="min-h-[140px] text-base resize-none"
                            maxLength={2000}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{locale === "zh" ? "详细描述可获得更好的结果" : "Detailed descriptions get better results"}</span>
                            <span>{prompt.length}/2000</span>
                        </div>
                    </Card>

                    {/* Style Selector */}
                    <Card className="p-6 space-y-4">
                        <h3 className="font-semibold text-lg">
                            {locale === "zh" ? "选择风格" : "Choose Style"}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${selectedStyle === style.id
                                        ? "border-primary bg-primary/5"
                                        : "border-muted hover:border-primary/50"
                                        }`}
                                >
                                    <span className="text-xl mb-1">{style.icon}</span>
                                    <span className="font-medium text-xs">{style.name}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {STYLES.find(s => s.id === selectedStyle)?.description}
                        </p>
                    </Card>

                    {/* Aspect Ratio */}
                    <Card className="p-6 space-y-4">
                        <h3 className="font-semibold text-lg">
                            {locale === "zh" ? "宽高比" : "Aspect Ratio"}
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            {ASPECT_RATIOS.map((ratio) => (
                                <button
                                    key={ratio.id}
                                    onClick={() => setSelectedRatio(ratio.id)}
                                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${selectedRatio === ratio.id
                                        ? "border-primary bg-primary/5"
                                        : "border-muted hover:border-primary/50"
                                        }`}
                                >
                                    <span className="text-lg mb-1">{ratio.icon}</span>
                                    <span className="font-medium text-xs">{ratio.name}</span>
                                    <span className="text-xs text-muted-foreground">{ratio.desc}</span>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Image to Video Coming Soon */}
                    <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <VideoIcon className="w-5 h-5 text-purple-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                        {locale === "zh" ? "图生视频" : "Image to Video"}
                                    </span>
                                    <span className="text-xs bg-purple-500/20 text-purple-600 px-2 py-0.5 rounded-full">
                                        {locale === "zh" ? "即将上线" : "Coming Soon"}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {locale === "zh"
                                        ? "将您生成的图像转换为精彩视频"
                                        : "Transform your generated images into stunning videos"}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Credits & Action */}
                    <div className="flex flex-col gap-4">
                        {user ? (
                            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                                <span className="text-muted-foreground">
                                    {locale === "zh" ? "剩余积分：" : "Your Balance:"}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-xl">{credits?.remaining_credits ?? 0}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {locale === "zh" ? "积分" : "credits"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-primary/10 p-4 rounded-lg text-sm text-primary flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                {locale === "zh"
                                    ? "新用户免费获得 30 积分（3 次生成）！"
                                    : "New users get 30 free credits (3 generations)!"}
                            </div>
                        )}

                        <Button
                            size="lg"
                            className="w-full text-lg h-14 relative overflow-hidden group bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                            onClick={() => handleGenerate()}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {locale === "zh" ? "正在生成..." : "Generating..."}
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    {locale === "zh" ? "生成图像（10 积分）" : "Generate (10 Credits)"}
                                </>
                            )}
                        </Button>

                        {error && (
                            <p className="text-destructive text-sm text-center font-medium">{error}</p>
                        )}

                        {/* Login Prompt */}
                        {showLoginPrompt && !user && (
                            <Card className="p-4 bg-blue-500/10 border-blue-500/30">
                                <div className="text-center space-y-3">
                                    <h4 className="font-semibold">
                                        {locale === "zh" ? "登录后生成" : "Sign In to Generate"}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {locale === "zh"
                                            ? "创建免费账户开始使用 Flux.2 [Klein] 生成图像。免费获得 3 次生成机会！"
                                            : "Create a free account to start generating images with Flux.2 [Klein]. Get 3 free generations!"}
                                    </p>
                                    <Button
                                        onClick={() => window.location.href = `/${locale}/sign-in`}
                                        className="w-full"
                                    >
                                        {locale === "zh" ? "登录 / 注册" : "Sign In / Sign Up"}
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Right Column: Result */}
                <div className="space-y-6">
                    <Card className="p-6 min-h-[600px] flex flex-col">
                        <h3 className="font-semibold text-lg mb-4">
                            {locale === "zh" ? "生成结果" : "Generated Result"}
                        </h3>

                        <div className="flex-1 flex items-center justify-center">
                            {resultImage ? (
                                <div className="space-y-4 w-full">
                                    <div className="relative aspect-square w-full max-w-[512px] mx-auto rounded-lg overflow-hidden border bg-muted/50">
                                        <Image
                                            src={resultImage}
                                            alt="Generated by Flux.2 [Klein]"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-center">
                                        <Button
                                            onClick={handleDownload}
                                            className="flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            {locale === "zh" ? "下载图片" : "Download"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setResultImage(null);
                                                setPrompt("");
                                            }}
                                        >
                                            {locale === "zh" ? "生成新图" : "Generate New"}
                                        </Button>
                                    </div>
                                </div>
                            ) : isGenerating ? (
                                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                    <div className="relative">
                                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                        <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                                    </div>
                                    <span className="text-lg">
                                        {locale === "zh" ? "Flux.2 [Klein] 正在创作..." : "Flux.2 [Klein] is creating..."}
                                    </span>
                                    <span className="text-sm">
                                        {locale === "zh" ? "通常需要 5-15 秒" : "Usually takes 5-15 seconds"}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground p-8 space-y-4">
                                    <div className="text-6xl">🎨</div>
                                    <p>
                                        {locale === "zh"
                                            ? "输入描述并点击「生成」查看魔法"
                                            : "Enter a prompt and click \"Generate\" to see the magic"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
