"use client";

/**
 * Default visual when a reference has no images yet.
 */
export default function ReferencePlaceholder(_props: { size?: "sm" | "md" | "lg" }) {
  void _props;
  return (
    <div className="relative w-full h-full overflow-hidden bg-bs-mitternacht">
      <img
        src="/references/_placeholder.png"
        alt=""
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
}
