import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/api/webhooks/(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
/** Legacy non-localized paths — role-gated in middleware. */
const isAdminRoute = createRouteMatcher(["/admin", "/admin/(.*)"]);
const isJoueurRoute = createRouteMatcher(["/joueur", "/joueur/(.*)"]);
const isManagerRoute = createRouteMatcher(["/manager", "/manager/(.*)"]);

const SUPPORTED_LANGUAGES = ["FR", "EN", "ES", "PT", "DE"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

type SessionMetadata = {
  onboardingCompleted?: boolean;
  role?: string;
  langue?: string;
};

function isClerkSyncRequest(req: NextRequest): boolean {
  const params = req.nextUrl.searchParams;
  return (
    params.has("__clerk_handshake") ||
    params.has("__clerk_status") ||
    params.has("__clerk_db_jwt")
  );
}

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: string }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function getUserLanguage(
  sessionClaims: { metadata?: SessionMetadata } | null | undefined,
): SupportedLanguage {
  const userLang = sessionClaims?.metadata?.langue as SupportedLanguage;
  return SUPPORTED_LANGUAGES.includes(userLang) ? userLang : "FR";
}

function createLocalizedUrl(
  basePath: string,
  language: SupportedLanguage,
  req: NextRequest,
): URL {
  return new URL(`/${language.toLowerCase()}${basePath}`, req.url);
}

function redirectForRole(
  role: string | undefined,
  userLanguage: SupportedLanguage,
  req: NextRequest,
) {
  if (role === "ADMIN") {
    return NextResponse.redirect(createLocalizedUrl("/admin", userLanguage, req));
  }
  if (role === "JOUEUR") {
    return NextResponse.redirect(createLocalizedUrl("/joueur", userLanguage, req));
  }
  if (role === "MANAGER") {
    return NextResponse.redirect(
      createLocalizedUrl("/manager", userLanguage, req),
    );
  }
  return null;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isClerkSyncRequest(req)) {
    return NextResponse.next();
  }

  try {
    const { userId, sessionClaims, redirectToSignIn } = await auth();

    const metadata =
      (sessionClaims as { metadata?: SessionMetadata } | null)?.metadata ?? {};

    const userLanguage = getUserLanguage(sessionClaims);

    if (userId && req.nextUrl.pathname === "/" && !metadata.onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    if (userId && req.nextUrl.pathname === "/" && metadata.onboardingCompleted) {
      const roleRedirect = redirectForRole(metadata.role, userLanguage, req);
      if (roleRedirect) return roleRedirect;
    }

    if (isPublicRoute(req)) return NextResponse.next();

    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    if (metadata.onboardingCompleted && isOnboardingRoute(req)) {
      const roleRedirect = redirectForRole(metadata.role, userLanguage, req);
      if (roleRedirect) return roleRedirect;
    }

    if (isOnboardingRoute(req)) {
      if (req.nextUrl.searchParams.get("onboardingCompleted")) {
        const roleRedirect = redirectForRole(metadata.role, userLanguage, req);
        if (roleRedirect) return roleRedirect;
      }
      return NextResponse.next();
    }

    if (!metadata.onboardingCompleted && !isOnboardingRoute(req)) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    if (isAdminRoute(req)) {
      if (metadata.role === "ADMIN") return NextResponse.next();
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isJoueurRoute(req)) {
      if (metadata.role === "JOUEUR") return NextResponse.next();
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isManagerRoute(req)) {
      if (metadata.role === "MANAGER") return NextResponse.next();
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Localized routes (/fr/joueur, /fr/joueur/parcours, …) reach here:
    // allow any signed-in user who completed onboarding.
    return NextResponse.next();
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
