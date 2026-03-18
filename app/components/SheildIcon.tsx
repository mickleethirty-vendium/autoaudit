export default function ShieldIcon({ className = "w-8 h-8" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L4 5V11C4 16.5 7.5 20.7 12 22C16.5 20.7 20 16.5 20 11V5L12 2Z"
        fill="var(--aa-red)"
      />
      <path
        d="M9.5 12.5L11 14L15 10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}