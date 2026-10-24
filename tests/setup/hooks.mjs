// Resolve hook for the node:test suite. It maps the "@/..." alias and
// extensionless relative imports to TypeScript files, and swaps the database
// and session modules for the in-memory doubles in ./mocks so that the API
// route handlers can run offline.
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const double = (name) =>
  pathToFileURL(path.join(root, "tests/setup/mocks", name)).href;

const doubles = {
  "@/lib/prisma": double("prisma.ts"),
  "@/lib/auth": double("auth.ts"),
  "@prisma/client": double("prisma-client.ts"),
  "next-auth": double("next-auth.ts"),
};

function findSource(base) {
  const candidates = [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")];
  return candidates.find((candidate) => existsSync(candidate));
}

export async function resolve(specifier, context, nextResolve) {
  if (Object.hasOwn(doubles, specifier)) {
    return { url: doubles[specifier], shortCircuit: true };
  }

  let base = null;
  if (specifier.startsWith("@/")) {
    base = path.join(root, "src", specifier.slice(2));
  } else if (
    /^\.\.?\//.test(specifier) &&
    !path.extname(specifier) &&
    context.parentURL?.startsWith("file:")
  ) {
    base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
  }

  const source = base && findSource(base);
  if (source) {
    return { url: pathToFileURL(source).href, shortCircuit: true };
  }

  // `next` ships no "exports" map, so plain Node needs the file extension.
  if (specifier === "next/server") {
    return nextResolve("next/server.js", context);
  }

  return nextResolve(specifier, context);
}
