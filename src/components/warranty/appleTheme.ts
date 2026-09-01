// Shared design tokens for the "Apple Minimal" warranty page direction.
// Scoped to src/components/warranty/* only — does not touch global Tailwind
// config or app-wide styles, so other pages are unaffected.

// Font stack: prefer native SF Pro on Apple platforms, fall back to the
// Inter webfont (loaded in index.html) everywhere else.
export const FONT_STACK =
	'-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif';

// Distinctive geometric sans used only for the small "Tayaria 360° Warranty"
// eyebrow/kicker label (loaded in index.html) — gives that one label some
// typographic contrast against the neutral body font instead of everything
// reading as the same system face.
export const KICKER_FONT_STACK = '"Space Grotesk", ' + FONT_STACK;

// One dominant accent (deep, refined red) + a sparing yellow accent, per the
// Apple-minimal direction. Tuned from the existing tayaria.red (#C0392B) /
// tayaria.yellow (#FFA500) tokens for a slightly richer, more premium feel.
export const COLORS = {
	red: "#A6291F",
	redHover: "#8A2018",
	redTint: "#FBEAE8",
	redRing: "rgba(166,41,31,0.18)",
	yellow: "#E8A100",
	yellowTint: "#FFF6E1",
	ink: "#0A0A0A",
	subtle: "#6B7280",
};

// Reusable className fragments so RegisterWarranty / CheckWarrantyStatus stay consistent.
export const fieldLabelClass =
	"text-[13px] font-medium tracking-wide text-gray-500";

export const fieldInputClass =
	"h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] text-[#0A0A0A] placeholder:text-gray-400 shadow-sm transition-all duration-200 focus:border-[#A6291F] focus:outline-none focus:ring-4 focus:ring-[#A6291F]/[0.12] md:text-sm";

export const sectionCardClass =
	"rounded-2xl border border-gray-200 bg-[#FAFAFA] p-5";

export const primaryButtonClass =
	"inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#A6291F] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-8px_rgba(166,41,31,0.55)] transition-all duration-200 hover:-translate-y-px hover:bg-[#8A2018] hover:shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_28px_-8px_rgba(166,41,31,0.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A6291F]/20 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0";

export const secondaryButtonClass =
	"inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[13px] font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:border-gray-300 hover:bg-gray-50";

export const pillClass =
	"inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-gray-600 shadow-sm";
