import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Adicionar headers de segurança em todas as respostas
    const response = NextResponse.next();

    // Prevenir clickjacking
    response.headers.set("X-Frame-Options", "DENY");

    // Prevenir MIME type sniffing
    response.headers.set("X-Content-Type-Options", "nosniff");

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Verificar se está autenticado para rotas protegidas
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
        const isApiAdminRoute = req.nextUrl.pathname.startsWith("/api/users") ||
                                req.nextUrl.pathname.startsWith("/api/vaquinhas") ||
                                req.nextUrl.pathname.startsWith("/api/upload") ||
                                req.nextUrl.pathname.startsWith("/api/config") ||
                                req.nextUrl.pathname.startsWith("/api/inscricoes") ||
                                req.nextUrl.pathname.startsWith("/api/scraper") ||
                                req.nextUrl.pathname.startsWith("/api/admin");

        // Rota de login do admin não precisa de autenticação
        if (req.nextUrl.pathname === "/admin/login") {
          return true;
        }

        // Rotas do admin requerem autenticação
        if (isAdminRoute || isApiAdminRoute) {
          return !!token;
        }

        // Rotas públicas
        return true;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    // Rotas do admin
    "/admin/:path*",
    // APIs que requerem autenticação
    "/api/users/:path*",
    "/api/vaquinhas/:path*",
    "/api/upload/:path*",
    "/api/config/:path*",
    "/api/inscricoes/:path*",
    "/api/scraper/:path*",
    "/api/admin/:path*",
  ],
};
