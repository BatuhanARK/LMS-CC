import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

export default clerkMiddleware(async (auth, req) => {
  const { userId } = auth();
  if (!userId) return;
  const client = clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;
  console.log("✅ Role from publicMetadata:", role);
  const { sessionClaims } = auth();
  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req) && !allowedRoles.includes(role!)) {
      return NextResponse.redirect(new URL(`/${role ?? "unauthorized"}`, req.url));
    }
  }
  //const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  //console.log("user role:", role);
  //console.log("Session claims:", sessionClaims);
  //for (const { matcher, allowedRoles } of matchers) {
  //  if (matcher(req) && !allowedRoles.includes(role!)) {
  //    return NextResponse.redirect(new URL(`/${role}`, req.url));
  //  }
  //}
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
