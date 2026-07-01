import { eq } from 'drizzle-orm';

import type { GithubUser } from '$lib/server/oauth';

import { db } from './client';
import { users } from './schema';
import { asInsert, asUpdate } from './write';

export async function upsertGithubUser(profile: GithubUser): Promise<string> {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.githubId, profile.id))
    .limit(1);

  const changes = {
    githubLogin: profile.login,
    name: profile.name ?? null,
    avatarUrl: profile.avatar_url ?? null
  };

  if (existing) {
    await db.update(users).set(asUpdate(changes)).where(eq(users.id, existing.id));
    return existing.id;
  }

  const values = {
    githubId: profile.id,
    githubLogin: profile.login,
    name: profile.name ?? null,
    avatarUrl: profile.avatar_url ?? null
  };

  const [row] = await db
    .insert(users)
    .values(asInsert(values))
    .returning({ id: users.id });

  return row.id;
}
