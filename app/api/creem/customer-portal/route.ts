import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";



export async function GET() {
    try {
        // 1. 验证用户登录
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. 获取用户的 Creem Customer ID
        const { data: customerData } = await supabase
            .from("customers")
            .select("creem_customer_id")
            .eq("user_id", user.id)
            .single();

        if (!customerData?.creem_customer_id) {
            return NextResponse.json(
                { error: "No subscription found" },
                { status: 404 }
            );
        }

        // 3. 调用 Creem API 获取 Customer Portal URL
        const response = await fetch(
            `${process.env.CREEM_API_URL}/customers/${customerData.creem_customer_id}/billing-portal`,
            {
                method: "POST",
                headers: {
                    "x-api-key": process.env.CREEM_API_KEY!,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Creem API Error:", data);
            return NextResponse.json(
                { error: "Failed to get portal URL", details: data },
                { status: 500 }
            );
        }

        return NextResponse.json({ url: data.url });

    } catch (error) {
        console.error("Customer portal error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
