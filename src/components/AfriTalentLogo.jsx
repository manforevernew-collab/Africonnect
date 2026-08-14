const sizeMap = {
  sm: { w: 184, h: 40, scale: 0.82 },
  md: { w: 232, h: 52, scale: 1 },
  lg: { w: 280, h: 64, scale: 1.2 },
  xl: { w: 374, h: 84, scale: 1.6 },
}

export default function AfriTalentLogo({
  className = '',
  showTagline = false,
  size = 'md',
  variant = 'default'
}) {
  const s = sizeMap[size]
  const isLight = variant === 'light'
  const logoSrc = isLight ? '/AfriTalentLogo-light.svg' : '/AfriTalentLogo.svg'

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        lineHeight: 1,
      }}
      aria-label="AfriTalent logo"
    >
      <img
        src={logoSrc}
        alt="AfriTalent"
        style={{
          width: s.w,
          height: 'auto',
          display: 'block',
          maxWidth: '100%',
        }}
      />
      {showTagline && (
        <div
          style={{
            marginTop: 8,
            fontSize: Math.max(9, s.w * 0.04),
            letterSpacing: '0.18em',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: isLight ? '#C9D2DF' : '#64748B',
            whiteSpace: 'nowrap',
          }}
        >
          Professional Network
        </div>
      )}
    </div>
  )
}
