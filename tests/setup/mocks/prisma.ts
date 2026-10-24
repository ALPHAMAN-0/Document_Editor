// In-memory stand-in for the Prisma client. It implements only the calls the
// document API routes make, and records them so tests can inspect the queries.

export type FakeRole = "VIEWER" | "COMMENTER" | "EDITOR" | "ADMIN";

export interface FakeDocument {
  id: string;
  ownerId: string;
  title: string;
  content: string | null;
  contentHtml: string | null;
  wordCount: number;
  deletedAt: Date | null;
}

export interface FakePermission {
  documentId: string;
  userId: string;
  role: FakeRole;
}

export interface RecordedCall {
  op: string;
  args: Record<string, unknown>;
}

export const store: {
  documents: FakeDocument[];
  permissions: FakePermission[];
  calls: RecordedCall[];
} = { documents: [], permissions: [], calls: [] };

export function resetStore(): void {
  store.documents = [];
  store.permissions = [];
  store.calls = [];
}

export function addDocument(
  document: Pick<FakeDocument, "id" | "ownerId"> & Partial<FakeDocument>
): FakeDocument {
  const created: FakeDocument = {
    title: "Untitled Document",
    content: "",
    contentHtml: "",
    wordCount: 0,
    deletedAt: null,
    ...document,
  };
  store.documents.push(created);
  return created;
}

export function callsTo(op: string): RecordedCall[] {
  return store.calls.filter((call) => call.op === op);
}

export const prisma = {
  document: {
    async findUnique(args: { where: { id: string } }) {
      return store.documents.find((doc) => doc.id === args.where.id) ?? null;
    },
    async findMany(args: Record<string, unknown>) {
      store.calls.push({ op: "document.findMany", args });
      return [];
    },
    async count(args: Record<string, unknown>) {
      store.calls.push({ op: "document.count", args });
      return 0;
    },
    async create(args: { data: Pick<FakeDocument, "ownerId"> & Partial<FakeDocument> }) {
      store.calls.push({ op: "document.create", args });
      return addDocument({ id: `doc-${store.documents.length + 1}`, ...args.data });
    },
    async update(args: { where: { id: string }; data: Partial<FakeDocument> }) {
      store.calls.push({ op: "document.update", args });
      const document = store.documents.find((doc) => doc.id === args.where.id);
      if (!document) throw new Error("Record to update not found");
      return Object.assign(document, args.data);
    },
  },
  documentPermission: {
    async findUnique(args: {
      where: { documentId_userId: { documentId: string; userId: string } };
    }) {
      const { documentId, userId } = args.where.documentId_userId;
      return (
        store.permissions.find(
          (permission) =>
            permission.documentId === documentId && permission.userId === userId
        ) ?? null
      );
    },
  },
};
