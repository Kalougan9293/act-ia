"use client";

import { Star } from "lucide-react";

const reviews: { name: string; role: string; quote: string }[] = [];

function Stars() {
  return (
    <div className="flex justify-center gap-0.5" aria-label="5 étoiles sur 5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  if (reviews.length === 0) return null;

  return (
    <section className="bg-white pb-8 dark:bg-slate-900">
      <div className={`mx-auto grid max-w-3xl gap-6 px-4 sm:px-6 ${reviews.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {reviews.map((review) => (
          <figure key={review.name} className="text-center">
            <Stars />
            <blockquote className="mt-2 text-sm italic leading-relaxed text-slate-600 dark:text-slate-300">
              « {review.quote} »
            </blockquote>
            <figcaption className="mt-2">
              <p className="text-center text-sm text-slate-700 dark:text-slate-200">{review.name}</p>
              <p className="text-center text-xs text-slate-400 dark:text-slate-500">{review.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
