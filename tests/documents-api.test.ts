import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { NextRequest } from "next/server";
import {
  GET as listDocuments,
  POST as createDocument,
} from "@/app/api/documents/route";
import {
  DELETE as deleteDocument,
  GET as getDocument,
  PATCH as updateDocument,
} from "@/app/api/documents/[id]/route";
import { MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH } from "@/lib/validation";
import { signInAs, signOut } from "./setup/mocks/next-auth";
import {
  type FakeRole,
  addDocument,
  callsTo,
  resetStore,
  store,
} from "./setup/mocks/prisma";

const OWNER = "user-owner";
const GUEST = "user-guest";
const DOC = "doc-1";

function request(path: string, method = "GET", body?: unknown): NextRequest {
  if (body === undefined) {
    return new NextRequest(`http://localhost${path}`, { method });
  }
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const forDocument = (id: string) => ({ params: Promise.resolve({ id }) });

const patch = (body: unknown) =>
  updateDocument(request(`/api/documents/${DOC}`, "PATCH", body), forDocument(DOC));

function share(role: FakeRole): void {
  store.permissions.push({ documentId: DOC, userId: GUEST, role });
}

const theDocument = () => store.documents.find((doc) => doc.id === DOC)!;

beforeEach(() => {
  resetStore();
  signOut();
  addDocument({ id: DOC, ownerId: OWNER, title: "Roadmap" });
});

describe("authentication", () => {
  it("answers 401 on every document endpoint without a session", async () => {
    const responses = await Promise.all([
      listDocuments(request("/api/documents")),
      createDocument(request("/api/documents", "POST", { title: "x" })),
      getDocument(request(`/api/documents/${DOC}`), forDocument(DOC)),
      patch({ title: "Hijacked" }),
      deleteDocument(request(`/api/documents/${DOC}`, "DELETE"), forDocument(DOC)),
    ]);

    assert.deepEqual(
      responses.map((response) => response.status),
      [401, 401, 401, 401, 401]
    );
    assert.equal(theDocument().title, "Roadmap");
    assert.equal(theDocument().deletedAt, null);
    assert.equal(store.documents.length, 1);
  });
});

describe("document permissions", () => {
  it("refuses a user the document is not shared with", async () => {
    signInAs(GUEST);

    const read = await getDocument(request(`/api/documents/${DOC}`), forDocument(DOC));
    const write = await patch({ title: "Hijacked" });
    const remove = await deleteDocument(
      request(`/api/documents/${DOC}`, "DELETE"),
      forDocument(DOC)
    );

    assert.deepEqual([read.status, write.status, remove.status], [403, 403, 403]);
    assert.equal(theDocument().title, "Roadmap");
    assert.equal(theDocument().deletedAt, null);
  });

  it("lets a viewer read but not edit", async () => {
    share("VIEWER");
    signInAs(GUEST);

    const read = await getDocument(request(`/api/documents/${DOC}`), forDocument(DOC));
    const write = await patch({ title: "Hijacked" });

    assert.equal(read.status, 200);
    assert.equal((await read.json()).title, "Roadmap");
    assert.equal(write.status, 403);
    assert.equal(theDocument().title, "Roadmap");
  });

  it("does not let a commenter edit", async () => {
    share("COMMENTER");
    signInAs(GUEST);

    assert.equal((await patch({ contentHtml: "<p>x</p>" })).status, 403);
    assert.equal(theDocument().contentHtml, "");
  });

  it("lets an editor edit", async () => {
    share("EDITOR");
    signInAs(GUEST);

    const response = await patch({ title: "  Roadmap 2027  ", contentHtml: "<p>Q1</p>" });

    assert.equal(response.status, 200);
    assert.equal(theDocument().title, "Roadmap 2027");
    assert.equal(theDocument().contentHtml, "<p>Q1</p>");
  });

  it("lets only the owner move a document to trash", async () => {
    share("ADMIN");
    signInAs(GUEST);
    const byAdmin = await deleteDocument(
      request(`/api/documents/${DOC}`, "DELETE"),
      forDocument(DOC)
    );
    assert.equal(byAdmin.status, 403);
    assert.equal(theDocument().deletedAt, null);

    signInAs(OWNER);
    const byOwner = await deleteDocument(
      request(`/api/documents/${DOC}`, "DELETE"),
      forDocument(DOC)
    );
    assert.equal(byOwner.status, 200);
    assert.ok(theDocument().deletedAt instanceof Date);
  });
});

describe("PATCH /api/documents/[id] payload", () => {
  beforeEach(() => signInAs(OWNER));

  it("updates only allow-listed fields", async () => {
    const response = await patch({
      title: "Renamed",
      ownerId: "attacker",
      id: "doc-other",
      deletedAt: "2020-01-01T00:00:00.000Z",
    });

    assert.equal(response.status, 200);
    assert.deepEqual(callsTo("document.update")[0].args.data, { title: "Renamed" });
    assert.equal(theDocument().ownerId, OWNER);
  });

  it("rejects a payload without any editable field", async () => {
    assert.equal((await patch({ ownerId: "attacker" })).status, 400);
    assert.equal(callsTo("document.update").length, 0);
  });

  it("rejects malformed JSON and non-object bodies with 400", async () => {
    const statuses = [];
    for (const body of ["{not json", "null", "[1,2,3]", '"title"']) {
      statuses.push((await patch(body)).status);
    }

    assert.deepEqual(statuses, [400, 400, 400, 400]);
    assert.equal(callsTo("document.update").length, 0);
  });

  it("rejects an empty or over-long title", async () => {
    assert.equal((await patch({ title: "   " })).status, 400);
    assert.equal((await patch({ title: "a".repeat(MAX_TITLE_LENGTH + 1) })).status, 400);
    assert.equal(theDocument().title, "Roadmap");
  });

  it("rejects oversized content with 413", async () => {
    const response = await patch({ contentHtml: "x".repeat(MAX_CONTENT_LENGTH + 1) });

    assert.equal(response.status, 413);
    assert.equal(callsTo("document.update").length, 0);
  });

  it("rejects an invalid word count", async () => {
    const statuses = [];
    for (const wordCount of [-1, "abc", 2 ** 31]) {
      statuses.push((await patch({ wordCount })).status);
    }

    assert.deepEqual(statuses, [400, 400, 400]);
    assert.equal((await patch({ wordCount: 42 })).status, 200);
    assert.equal(theDocument().wordCount, 42);
  });
});

describe("GET /api/documents", () => {
  beforeEach(() => signInAs(GUEST));

  it("only queries documents the user owns or was given access to", async () => {
    const response = await listDocuments(request("/api/documents"));

    assert.equal(response.status, 200);
    const where = callsTo("document.findMany")[0].args.where as { AND: unknown[] };
    assert.deepEqual(where.AND[2], {
      OR: [{ ownerId: GUEST }, { permissions: { some: { userId: GUEST } } }],
    });
    assert.deepEqual(callsTo("document.count")[0].args.where, where);
  });

  it("uses default paging when page and limit are malformed", async () => {
    const response = await listDocuments(request("/api/documents?page=abc&limit=-5"));

    assert.equal(response.status, 200);
    const { skip, take } = callsTo("document.findMany")[0].args;
    assert.deepEqual({ skip, take }, { skip: 0, take: 20 });
    assert.deepEqual((await response.json()).pagination, {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  });

  it("caps the page size at 100", async () => {
    await listDocuments(request("/api/documents?page=3&limit=1000"));

    const { skip, take } = callsTo("document.findMany")[0].args;
    assert.deepEqual({ skip, take }, { skip: 200, take: 100 });
  });

  it("ignores sort fields outside the allow-list", async () => {
    await listDocuments(request("/api/documents?sort=ownerId"));

    assert.deepEqual(callsTo("document.findMany")[0].args.orderBy, { updatedAt: "desc" });
  });
});

describe("POST /api/documents", () => {
  beforeEach(() => signInAs(GUEST));

  it("creates the document for the signed-in user, whatever the body says", async () => {
    const response = await createDocument(
      request("/api/documents", "POST", { title: "  Plan  ", ownerId: OWNER })
    );

    assert.equal(response.status, 201);
    const data = callsTo("document.create")[0].args.data as Record<string, unknown>;
    assert.equal(data.ownerId, GUEST);
    assert.equal(data.title, "Plan");
  });

  it("falls back to the default title for a missing or non-object body", async () => {
    for (const body of [undefined, "null", "{not json", { title: 123 }]) {
      const response = await createDocument(request("/api/documents", "POST", body));
      assert.equal(response.status, 201);
    }

    const titles = callsTo("document.create").map(
      (call) => (call.args.data as Record<string, unknown>).title
    );
    assert.deepEqual(titles, Array(4).fill("Untitled Document"));
  });

  it("rejects an over-long title", async () => {
    const response = await createDocument(
      request("/api/documents", "POST", { title: "a".repeat(MAX_TITLE_LENGTH + 1) })
    );

    assert.equal(response.status, 400);
    assert.equal(callsTo("document.create").length, 0);
  });
});
