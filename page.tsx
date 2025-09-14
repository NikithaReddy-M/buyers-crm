"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBuyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "Chandigarh",
    propertyType: "Apartment",
    bhk: "",
    purpose: "Buy",
    budgetMin: "",
    budgetMax: "",
    timeline: "Exploring",
    source: "Website",
    notes: "",
    tags: "",
  });

  const validate = () => {
    if (form.fullName.trim().length < 2)
      return "Full name must be at least 2 characters";
    if (!/^\d{10,15}$/.test(form.phone)) return "Phone must be 10–15 digits";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Invalid email";
    if (
      form.budgetMin &&
      form.budgetMax &&
      Number(form.budgetMax) < Number(form.budgetMin)
    )
      return "Budget Max must be ≥ Budget Min";
    if (
      (form.propertyType === "Apartment" || form.propertyType === "Villa") &&
      !form.bhk
    )
      return "BHK is required for Apartment/Villa";
    return null;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/buyers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
            budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
            tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
          }),
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      router.push("/buyers");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">New Lead</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          className="w-full border p-2"
        />
        <input
          name="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2"
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border p-2"
        />

        <select
          name="city"
          value={form.city}
          onChange={handleChange}
          className="w-full border p-2"
        >
          <option>Chandigarh</option>
          <option>Mohali</option>
          <option>Zirakpur</option>
          <option>Panchkula</option>
          <option>Other</option>
        </select>

        <select
          name="propertyType"
          value={form.propertyType}
          onChange={handleChange}
          className="w-full border p-2"
        >
          <option>Apartment</option>
          <option>Villa</option>
          <option>Plot</option>
          <option>Office</option>
          <option>Retail</option>
        </select>

        {(form.propertyType === "Apartment" ||
          form.propertyType === "Villa") && (
          <select
            name="bhk"
            value={form.bhk}
            onChange={handleChange}
            className="w-full border p-2"
          >
            <option value="">Select BHK</option>
            <option>ONE</option>
            <option>TWO</option>
            {/* <option>3</option>
            <option>4</option> */}
            <option>STUDIO</option>
          </select>
        )}

        <select
          name="purpose"
          value={form.purpose}
          onChange={handleChange}
          className="w-full border p-2"
        >
          <option>Buy</option>
          <option>Rent</option>
        </select>

        <div className="flex gap-2">
          <input
            name="budgetMin"
            placeholder="Budget Min"
            value={form.budgetMin}
            onChange={handleChange}
            className="w-1/2 border p-2"
          />
          <input
            name="budgetMax"
            placeholder="Budget Max"
            value={form.budgetMax}
            onChange={handleChange}
            className="w-1/2 border p-2"
          />
        </div>

        <select
          name="timeline"
          value={form.timeline}
          onChange={handleChange}
          className="w-full border p-2"
        >
          <option value="0-3m">0-3m</option>
          <option value="3-6m">3-6m</option>
          <option value=">6m">&gt;6m</option>
          <option value="Exploring">Exploring</option>
        </select>

        <select
          name="source"
          value={form.source}
          onChange={handleChange}
          className="w-full border p-2"
        >
          <option>Website</option>
          <option>Referral</option>
          <option>Walk-in</option>
          <option>Call</option>
          <option>Other</option>
        </select>

        <textarea
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          className="w-full border p-2"
          maxLength={1000}
        />

        <input
          name="tags"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={handleChange}
          className="w-full border p-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Create Lead"}
        </button>
      </form>
    </div>
  );
}
