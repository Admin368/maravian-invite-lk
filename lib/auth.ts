import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { getUserByEmail } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export type Session = {
  id: number;
  email: string;
  name: string;
  isOrganizer: boolean;
};

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as Session;
  } catch (error) {
    return null;
  }
}

export async function createSession(email: string): Promise<Session | null> {
  const user = await getUserByEmail(email);
  const cookieStore = await cookies();

  if (!user) return null;

  const session: Session = {
    id: user.id,
    email: user.email,
    name: user.name,
    isOrganizer: user.is_organizer,
  };

  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return session;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
