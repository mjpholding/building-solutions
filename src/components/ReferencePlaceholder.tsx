"use client";

/**
 * Default visual when a reference has no images yet.
 * Just shows the brand placeholder photo.
 */
export default function ReferencePlaceholder(_props: { size?: "sm" | "md" | "lg" }) {
  void _props;
  return (
    <div className="relative w-full h-full overflow-hidden bg-bs-hellgrau">
      <img
        src="/references/_placeholder.jpg"
        alt=""
        className="w-full h-full object-cover"
      />
    </div>
  );
}
