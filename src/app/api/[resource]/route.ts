import { NextResponse } from "next/server";
import { repos } from "@/repositories";

export async function GET(
  _: Request,
  { params }: { params: { resource: string } },
) {
  const repo = repos[params.resource];
  if (!repo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(await repo.getAll());
}
