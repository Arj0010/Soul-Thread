interface BadgeProps {
  type: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export default function Badge({ type, size = 'md', label }: BadgeProps) {
  const badges: { [key: string]: { icon: string; color: string; name: string } } = {
    'Beginner Badge': { icon: '🌱', color: 'bg-green-100 text-green-800', name: 'Beginner' },
    'Week Warrior Badge': { icon: '⚔️', color: 'bg-blue-100 text-blue-800', name: 'Week Warrior' },
    'Prolific Writer Badge': { icon: '✍️', color: 'bg-purple-100 text-purple-800', name: 'Prolific Writer' },
    'Community Star Badge': { icon: '⭐', color: 'bg-yellow-100 text-yellow-800', name: 'Community Star' },
    'Voice Master Badge': { icon: '🎤', color: 'bg-pink-100 text-pink-800', name: 'Voice Master' },
    'Consistent Creator Badge': { icon: '🔥', color: 'bg-orange-100 text-orange-800', name: 'Consistent Creator' },
    'Trendsetter Badge': { icon: '🚀', color: 'bg-indigo-100 text-indigo-800', name: 'Trendsetter' },
    'Marathon Badge': { icon: '🏃', color: 'bg-red-100 text-red-800', name: 'Marathon' },
  }

  const badge = badges[type] || { icon: '🏅', color: 'bg-gray-100 text-gray-800', name: type }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-full font-semibold ${badge.color} ${sizeClasses[size]}`}>
      <span className={iconSizes[size]}>{badge.icon}</span>
      <span>{label || badge.name}</span>
    </div>
  )
}
