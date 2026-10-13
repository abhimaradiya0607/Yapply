const LOCAL_DATABASE_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function connectionStringForRuntime(connectionString: string): string {
  if (isLocalDatabase(connectionString)) {
    return connectionString;
  }

  return withVerifiedTls(connectionString);
}

function isLocalDatabase(connectionString: string): boolean {
  if (connectionString.startsWith("/")) {
    return true;
  }

  let hostname: string;
  try {
    hostname = new URL(connectionString).hostname.toLowerCase();
  } catch {
    throw new Error("DATABASE_URL is not a valid database URL");
  }

  return hostname.length === 0 || LOCAL_DATABASE_HOSTS.has(hostname);
}

function withVerifiedTls(connectionString: string): string {
  const queryIndex = connectionString.indexOf("?");
  const base = queryIndex === -1 ? connectionString : connectionString.slice(0, queryIndex);
  const params = new URLSearchParams(queryIndex === -1 ? "" : connectionString.slice(queryIndex + 1));

  // pg 8 overwrites a Pool `ssl` option with the connection string. `sslmode=require`
  // plus `uselibpqcompat=true` turns certificate checks off. `verify-full` keeps them on.
  params.delete("uselibpqcompat");
  params.set("sslmode", "verify-full");

  return `${base}?${params.toString()}`;
}
