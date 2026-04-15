"use client";

/**
 * Default visual when a reference has no images yet.
 * Uses the dashboard hero photo, focused on the lower architectural
 * part so it reads as a façade rather than sky.
 */
export default function ReferencePlaceholder(_props: { size?: "sm" | "md" | "lg" }) {
  void _props;
  return (
    <div className="relative w-full h-full overflow-hidden bg-bs-mitternacht">
      <img
        src="/hero/dashboard-hero.jpg"
        alt=""
        className="w-full h-full object-cover"
        style={{ objectPosition: "center 75%" }}
      />
    </div>
  );
}
