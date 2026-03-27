const SectionTitle = ({ eyebrow, title, subtitle, align = 'left', action }) => {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start'

  return (
    <div className={`mb-6 flex flex-col gap-2 ${alignment}`}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral/70">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-semibold leading-tight text-neutral md:text-3xl">{title}</h2>
      {subtitle ? <p className="max-w-2xl text-sm text-neutral/60 md:text-base">{subtitle}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  )
}

export default SectionTitle
