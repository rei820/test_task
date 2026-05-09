interface Props {
  tag: string;
  onClick?: () => void;
}

const COLORS = [
  'bg-pink-100 text-pink-700',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-700',
  'bg-teal-100 text-teal-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
];

function colorFor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function TagBadge({ tag, onClick }: Props) {
  return (
    <span
      onClick={onClick}
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colorFor(tag)} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
    >
      {tag}
    </span>
  );
}
