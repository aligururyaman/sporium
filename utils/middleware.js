import { NextResponse } from "next/server";
import { auth, db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function middleware(request) {
  const user = auth.currentUser;

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    if (userData?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
