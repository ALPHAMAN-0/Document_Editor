// Stand-in for `next-auth`: each test decides which session the API sees.

export interface FakeSession {
  user: { id: string; name?: string | null; email?: string | null };
}

let currentSession: FakeSession | null = null;

export function signInAs(userId: string): void {
  currentSession = { user: { id: userId } };
}

export function signOut(): void {
  currentSession = null;
}

export async function getServerSession(): Promise<FakeSession | null> {
  return currentSession;
}
