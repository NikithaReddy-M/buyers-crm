import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import * as csv from "csv-parse/sync";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const records = csv.parse(text, { columns: true, skip_empty_lines: true });

    const errors: { row: number; error: string }[] = [];
    const validRecords: any[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      try {
        if (!row.fullName || row.fullName.trim().length < 2) throw new Error("Invalid fullName");
        if (!/^\d{10,15}$/.test(row.phone)) throw new Error("Invalid phone");
        if (row.email && !/^\S+@\S+\.\S+$/.test(row.email)) throw new Error("Invalid email");
        if ((row.propertyType === "Apartment" || row.propertyType === "Villa") && !row.bhk)
          throw new Error("BHK required for Apartment/Villa");
        if (row.budgetMin && row.budgetMax && Number(row.budgetMax) < Number(row.budgetMin))
          throw new Error("budgetMax must be >= budgetMin");

        validRecords.push({
          fullName: row.fullName.trim(),
          email: row.email?.trim() || null,
          phone: row.phone,
          city: row.city || null,
          propertyType: row.propertyType || null,
          bhk: row.bhk || null,
          purpose: row.purpose || null,
          budgetMin: row.budgetMin ? Number(row.budgetMin) : null,
          budgetMax: row.budgetMax ? Number(row.budgetMax) : null,
          timeline: row.timeline || null,
          source: row.source || null,
          status: row.status || "New",
          notes: row.notes || null,
          tags: row.tags ? row.tags.split(",").map((t: string) => t.trim()) : [],
          ownerId: "SYSTEM",
        });
      } catch (err: any) {
        errors.push({ row: i + 2, error: err.message }); // +2 for CSV header
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    await prisma.$transaction(
      validRecords.map((data) =>
        prisma.buyer.create({
          data: {
            ...data,
            histories: {
              create: {
                changedBy: data.ownerId || "SYSTEM",
                diff: { imported: true },
              },
            },
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: validRecords.length });
  } catch (err: any) {
    console.error("CSV Import Error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
