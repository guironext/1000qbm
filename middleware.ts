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
function getUserLanguage(sessionClaims: any): SupportedLanguage {
  const userLang = sessionClaims?.metadata?.langue as SupportedLanguage;
  return SUPPORTED_LANGUAGES.includes(userLang) ? userLang : "FR";
}

// Helper function to create language-specific URL
function createLocalizedUrl(basePath: string, language: SupportedLanguage, req: NextRequest): URL {
  const url = new URL(`/${language.toLowerCase()}${basePath}`, req.url);
  return url;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  console.log(sessionClaims?.metadata);
  console.log(req.nextUrl.searchParams.get("onboardingCompleted"));

  // Get user language from Clerk metadata
  const userLanguage = getUserLanguage(sessionClaims);

  if (
    userId &&
    req.nextUrl.pathname === "/" &&
    !sessionClaims?.metadata?.onboardingCompleted
  ) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  if (
    userId &&
    req.nextUrl.pathname === "/" &&
    sessionClaims?.metadata?.onboardingCompleted &&
    sessionClaims?.metadata?.role === "ADMIN"
  ) {
    const adminUrl = createLocalizedUrl("/admin", userLanguage, req);
    return NextResponse.redirect(adminUrl);
  }

  if (
    userId &&
    req.nextUrl.pathname === "/" &&
    sessionClaims?.metadata?.onboardingCompleted &&
    sessionClaims?.metadata?.role === "JOUEUR"
  ) {
    const joueurUrl = createLocalizedUrl("/joueur", userLanguage, req);
    return NextResponse.redirect(joueurUrl);
  }

  if (
    userId &&
    req.nextUrl.pathname === "/" &&
    sessionClaims?.metadata?.onboardingCompleted &&
    sessionClaims?.metadata?.role === "MANAGER"
  ) {
    const managerUrl = createLocalizedUrl("/manager", userLanguage, req);
    return NextResponse.redirect(managerUrl);
  }

  if (isPublicRoute(req)) return NextResponse.next();

  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({
      returnBackUrl: req.url,
    });
  }

  if (
    userId &&
    sessionClaims?.metadata?.onboardingCompleted &&
    isOnboardingRoute(req)
  ) {
    console.log("Onboarding completed, redirecting to appropriate page");

    if (sessionClaims?.metadata?.role === "ADMIN") {
      console.log("Redirecting admin to admin page");
      const adminUrl = createLocalizedUrl("/admin", userLanguage, req);
      return NextResponse.redirect(adminUrl);
    }

    if (sessionClaims?.metadata?.role === "JOUEUR") {
      console.log("Redirecting joueur to joueur page");
      const joueurUrl = createLocalizedUrl("/joueur", userLanguage, req);
      return NextResponse.redirect(joueurUrl);
    }

    if (sessionClaims?.metadata?.role === "MANAGER") {
      console.log("Redirecting manager to manager page");
      const managerUrl = createLocalizedUrl("/manager", userLanguage, req);
      return NextResponse.redirect(managerUrl);
    }
  }

  if (userId && isOnboardingRoute(req)) {
    if (req.nextUrl.searchParams.get("onboardingCompleted")) {
      console.log("Onboarding completed, redirecting to appropriate page");
      if (sessionClaims?.metadata?.role === "ADMIN") {
        const adminUrl = createLocalizedUrl("/admin", userLanguage, req);
        return NextResponse.redirect(adminUrl);
      }

      if (sessionClaims?.metadata?.role === "JOUEUR") {
        const joueurUrl = createLocalizedUrl("/joueur", userLanguage, req);
        return NextResponse.redirect(joueurUrl);
      }

      if (sessionClaims?.metadata?.role === "MANAGER") {
        const managerUrl = createLocalizedUrl("/manager", userLanguage, req);
        return NextResponse.redirect(managerUrl);
      }
    }
    return NextResponse.next();
  }

  if (
    userId &&
    !sessionClaims?.metadata?.onboardingCompleted &&
    !isOnboardingRoute(req)
  ) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  if (isAdminRoute(req)) {
    if (sessionClaims?.metadata?.role === "ADMIN") {
      return NextResponse.next();
    } else {
      const homepageUrl = new URL("/", req.url);
      return NextResponse.redirect(homepageUrl);
    }
  }

  if (isJoueurRoute(req)) {
    if (sessionClaims?.metadata?.role === "JOUEUR") {
      return NextResponse.next();
    } else {
      const homepageUrl = new URL("/", req.url);
      return NextResponse.redirect(homepageUrl);
    }
  }

  if (isManagerRoute(req)) {
    if (sessionClaims?.metadata?.role === "MANAGER") {
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
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
