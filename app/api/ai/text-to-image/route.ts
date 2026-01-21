import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { CREDITS_PER_GENERATION } from "@/config/pricing";
import Replicate from "replicate";

// 使用 Node.js runtime
export const runtime = 'nodejs';
export const maxDuration = 60; // Flux 生成通常在 2-10秒，60秒足够

// 初始化 Replicate 客户端
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

// 模型选择：
// - flux-1-schnell: 速度快，成本低，适合 SaaS（~2-4秒）
// - flux-1-dev: 更高质量，速度稍慢（~5-10秒）
// - flux-1-pro: 最高质量，商业使用
const FLUX_MODEL = "black-forest-labs/flux-schnell";

// 支持的宽高比
const SUPPORTED_RATIOS = [
    "1:1", "16:9", "21:9", "3:2", "2:3",
    "4:5", "5:4", "3:4", "4:3", "9:16", "9:21"
];

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    try {
        const {
            prompt,
            aspect_ratio = "1:1",
            style = "default",
        } = await request.json();

        // 1. 鉴权
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({
                error: "Please sign in first",
                code: "UNAUTHORIZED"
            }, { status: 401 });
        }

        // 2. 输入验证
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return NextResponse.json({
                error: "Please enter a prompt",
                code: "MISSING_PROMPT"
            }, { status: 400 });
        }

        if (prompt.length > 2000) {
            return NextResponse.json({
                error: "Prompt too long (max 2000 characters)",
                code: "PROMPT_TOO_LONG"
            }, { status: 400 });
        }

        // 验证 API Token
        if (!process.env.REPLICATE_API_TOKEN) {
            console.error("REPLICATE_API_TOKEN is not set");
            return NextResponse.json({
                error: "Service configuration error",
                code: "CONFIG_ERROR"
            }, { status: 500 });
        }

        // 3. 积分扣除（原子化扣费）
        const { data: deductSuccess, error: rpcError } = await supabase.rpc('decrease_credits', {
            p_user_id: user.id,
            p_amount: CREDITS_PER_GENERATION,
            p_description: `Flux.2 [Klein] Generation`
        });

        if (rpcError) {
            console.error("RPC Error:", rpcError);
            return NextResponse.json({
                error: "System busy, please retry",
                code: "SYSTEM_ERROR"
            }, { status: 500 });
        }

        if (!deductSuccess) {
            return NextResponse.json({
                error: "Insufficient credits, please top up",
                code: "INSUFFICIENT_CREDITS",
                required: CREDITS_PER_GENERATION
            }, { status: 402 });
        }

        // 4. 构建 Prompt
        let finalPrompt = prompt.trim();

        // 如果有风格选择，拼接到 prompt
        if (style && style !== 'default') {
            const styleMap: Record<string, string> = {
                photo: "photorealistic photography, natural lighting",
                art: "digital art masterpiece, vibrant colors",
                anime: "anime style, manga illustration",
                cinematic: "cinematic film still, dramatic lighting"
            };
            if (styleMap[style]) {
                finalPrompt = `${finalPrompt}, ${styleMap[style]}`;
            }
        }

        // 验证宽高比
        const ratio = SUPPORTED_RATIOS.includes(aspect_ratio) ? aspect_ratio : "1:1";

        console.log("=== Flux Generation Start ===");
        console.log("User:", user.id);
        console.log("Prompt:", finalPrompt);
        console.log("Aspect Ratio:", ratio);

        try {
            // 5. 调用 Replicate Flux API
            const output = await replicate.run(FLUX_MODEL, {
                input: {
                    prompt: finalPrompt,
                    aspect_ratio: ratio,
                    output_format: "webp",
                    output_quality: 90,
                    disable_safety_checker: false // 根据内容策略决定
                }
            });

            // Replicate 返回的是一个数组，包含图片 URL
            const outputArray = output as string[];
            const resultUrl = outputArray?.[0];

            if (!resultUrl || !resultUrl.startsWith('http')) {
                throw new Error("Flux returned invalid result");
            }

            console.log("Flux Result:", resultUrl);

            // 6. 存库记录
            await supabase.from("generations").insert({
                user_id: user.id,
                prompt: prompt.trim(),
                model_id: "flux-schnell",
                image_url: resultUrl,
                input_image_url: null,
                status: "succeeded",
                credits_cost: CREDITS_PER_GENERATION,
                metadata: {
                    provider: "replicate",
                    model: "flux-schnell",
                    aspect_ratio: ratio,
                    style,
                    enhanced_prompt: finalPrompt !== prompt.trim() ? finalPrompt : null
                }
            });

            return NextResponse.json({
                url: resultUrl,
                success: true,
                model: "flux-schnell"
            });

        } catch (aiError: any) {
            console.error("Replicate API Error:", aiError);

            // 7. 失败退款
            await supabase.rpc('decrease_credits', {
                p_user_id: user.id,
                p_amount: -CREDITS_PER_GENERATION,
                p_description: 'Refund: Flux Generation Failed'
            });

            return NextResponse.json({
                error: "Generation failed, credits refunded",
                code: "AI_FAILED",
                refunded: true,
                details: aiError?.message || "Unknown error"
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Route Error:", error);
        return NextResponse.json(
            { error: error.message || "Server error", code: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}
