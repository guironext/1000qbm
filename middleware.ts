import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/api/webhooks/(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isAdminRoute = createRouteMatcher(["/admin", "/admin/(.*)"]);
const isJoueurRoute = createRouteMatcher(["/joueur", "/joueur/(.*)"]);
const isManagerRoute = createRouteMatcher(["/manager", "/manager/(.*)"]);

// Supported languages
const SUPPORTED_LANGUAGES = ["FR", "EN", "ES", "PT", "DE"] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Helper function to get user language from Clerk metadata
function getUserLanguage(sessionClaims: { metadata?: { langue?: string } } | null | undefined): SupportedLanguage {
  const userLang = sessionClaims?.metadata?.langue as SupportedLanguage;
  return SUPPORTED_LANGUAGES.includes(userLang) ? userLang : "FR";
}

// Helper function to create language-specific URL
function createLocalizedUrl(basePath: string, language: SupportedLanguage, req: NextRequest): URL {
  const url = new URL(`/${language.toLowerCase()}${basePath}`, req.url);
  return url;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  try {
    let userId: string | null = null;
    let sessionClaims: { metadata?: { onboardingCompleted?: boolean; role?: string; langue?: string } } | null = null;
    let redirectToSignIn: (options?: { returnBackUrl?: string }) => NextResponse;

    try {
      const authResult = await auth();
      userId = authResult.userId ?? null;
      sessionClaims = authResult.sessionClaims as { metadata?: { onboardingCompleted?: boolean; role?: string; langue?: string } } | null;
      redirectToSignIn = authResult.redirectToSignIn;
    } catch (authError) {
      console.error("Auth error in middleware:", authError);
      // If auth fails and it's a public route, allow access
      if (isPublicRoute(req)) {
        return NextResponse.next();
      }
      // Otherwise, try to redirect to sign in, but fallback to next if that fails
      try {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      } catch {
        return NextResponse.next();
      }
    }

    // Safely access metadata with proper type checking
    const metadata = sessionClaims?.metadata || {} as { onboardingCompleted?: boolean; role?: string; langue?: string };

    // Get user language from Clerk metadata
    const userLanguage = getUserLanguage(sessionClaims);

  if (
    userId &&
    req.nextUrl.pathname === "/" &&
    !metadata.onboardingCompleted
  ) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  if (
    userId &&
    req.nextUrl.pathname === "/" &&
    metadata.onboardingCompleted &&
    metadata.role === "ADMIN"
  ) {
    const adminUrl = createLocalizedUrl("/admin", userLanguage, req);
    return NextResponse.redirect(adminUrl);
  }

  if (
    userId &&
    req.nextUrl.pathname === "/" &&
    metadata.onboardingCompleted &&
    metadata.role === "JOUEUR"
  ) {
    const joueurUrl = createLocalizedUrl("/joueur", userLanguage, req);
    return NextResponse.redirect(joueurUrl);
  }

  if (
    userId &&
    req.nextUrl.pathname === "/" &&
    metadata.onboardingCompleted &&
    metadata.role === "MANAGER"
  ) {
    const managerUrl = createLocalizedUrl("/manager", userLanguage, req);
    return NextResponse.redirect(managerUrl);
  }

  if (!userId) {
    return redirectToSignIn({
      returnBackUrl: req.url,
    });
  }

  if (
    userId &&
    metadata.onboardingCompleted &&
    isOnboardingRoute(req)
  ) {
    console.log("Onboarding completed, redirecting to appropriate page");

    if (metadata.role === "ADMIN") {
      console.log("Redirecting admin to admin page");
      const adminUrl = createLocalizedUrl("/admin", userLanguage, req);
      return NextResponse.redirect(adminUrl);
    }

    if (metadata.role === "JOUEUR") {
      console.log("Redirecting joueur to joueur page");
      const joueurUrl = createLocalizedUrl("/joueur", userLanguage, req);
      return NextResponse.redirect(joueurUrl);
    }

    if (metadata.role === "MANAGER") {
      console.log("Redirecting manager to manager page");
      const managerUrl = createLocalizedUrl("/manager", userLanguage, req);
      return NextResponse.redirect(managerUrl);
    }
  }

  if (userId && isOnboardingRoute(req)) {
    if (req.nextUrl.searchParams.get("onboardingCompleted")) {
      console.log("Onboarding completed, redirecting to appropriate page");
      if (metadata.role === "ADMIN") {
        const adminUrl = createLocalizedUrl("/admin", userLanguage, req);
        return NextResponse.redirect(adminUrl);
      }

      if (metadata.role === "JOUEUR") {
        const joueurUrl = createLocalizedUrl("/joueur", userLanguage, req);
        return NextResponse.redirect(joueurUrl);
      }

      if (metadata.role === "MANAGER") {
        const managerUrl = createLocalizedUrl("/manager", userLanguage, req);
        return NextResponse.redirect(managerUrl);
      }
    }
    return NextResponse.next();
  }

  if (
    userId &&
    !metadata.onboardingCompleted &&
    !isOnboardingRoute(req)
  ) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  if (isAdminRoute(req)) {
    if (metadata.role === "ADMIN") {
      return NextResponse.next();
    } else {
      const homepageUrl = new URL("/", req.url);
      return NextResponse.redirect(homepageUrl);
    }
  }

  if (isJoueurRoute(req)) {
    if (metadata.role === "JOUEUR") {
      return NextResponse.next();
    } else {
      const homepageUrl = new URL("/", req.url);
      return NextResponse.redirect(homepageUrl);
    }
  }

  if (isManagerRoute(req)) {
    if (metadata.role === "MANAGER") {
      return NextResponse.next();
    } else {
      const homepageUrl = new URL("/", req.url);
      return NextResponse.redirect(homepageUrl);
    }
  }

  if (userId) {
    return NextResponse.next();
  }

  return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // Return a response instead of throwing to prevent middleware invocation failure
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
