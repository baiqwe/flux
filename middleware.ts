import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 1. 先运行 intl 中间件，获取基础 Response (包含语言 Cookie 和重定向逻辑)
  let response = intlMiddleware(request)

  // 2. 初始化 Supabase 客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          // 同时更新 request 和 response
          // 更新 request 是为了让后续逻辑能读到最新 Cookie
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          // 更新 response 是为了写入浏览器
          // 关键点：我们直接修改 intl 返回的那个 response 对象，而不是创建新的
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 3. 刷新 Session - 性能优化
  // 仅在以下情况执行网络请求：
  // 1. 访问受保护路由（如 /dashboard）
  // 2. 存在 Supabase 认证 cookie（用户可能已登录）
  // 这避免了对纯静态 SEO 页面（首页、博客等）的 TTFB 阻塞
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = pathname.includes('/dashboard') || pathname.includes('/create');
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('sb-'));

  if (isProtectedRoute || hasAuthCookie) {
    // 只有在看起来像登录用户或访问私有页面时，才验证 session
    await supabase.auth.getUser();
  }

  return response
}

export const config = {
  // ✅ 使用静态宽泛匹配，不依赖动态变量
  // next-intl 中间件内部会自动处理语言匹配
  matcher: ['/((?!api|_next|_vercel|auth/callback|.*\\..*).*)',]
}
