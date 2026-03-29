import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const TopProgressBar = () => {
  const location = useLocation()
  const barRef = useRef(null)
  const prevPath = useRef(undefined)
  const timers = useRef([])

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const animate = () => {
    const bar = barRef.current
    if (!bar) return
    clear()

    // 1. Reset instantly (no transition)
    bar.style.transition = 'none'
    bar.style.opacity = '1'
    bar.style.width = '0%'

    // Force browser to apply the reset before animating
    // eslint-disable-next-line no-unused-expressions
    bar.offsetHeight

    // 2. Slowly fill to 75%
    bar.style.transition = 'width 2.5s cubic-bezier(0.1, 0.5, 0.3, 1)'
    bar.style.width = '75%'

    // 3. Snap to 100%
    timers.current.push(setTimeout(() => {
      bar.style.transition = 'width 0.2s ease'
      bar.style.width = '100%'

      // 4. Fade out
      timers.current.push(setTimeout(() => {
        bar.style.transition = 'opacity 0.35s ease'
        bar.style.opacity = '0'

        // 5. Fully reset for next use
        timers.current.push(setTimeout(() => {
          bar.style.transition = 'none'
          bar.style.width = '0%'
          bar.style.opacity = '1'
        }, 380))
      }, 230))
    }, 500))
  }

  // Run on initial page load / reload
  useEffect(() => {
    prevPath.current = location.pathname + location.search
    animate()
    return clear
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Run on route change
  useEffect(() => {
    if (prevPath.current === undefined) return
    const path = location.pathname + location.search
    if (prevPath.current === path) return
    prevPath.current = path
    animate()
  }, [location]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={barRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: '0%',
        background: 'linear-gradient(90deg, #f08a2f 0%, #ffb347 100%)',
        zIndex: 99999,
        pointerEvents: 'none',
        boxShadow: '0 0 10px 1px rgba(240, 138, 47, 0.55)',
      }}
    />
  )
}

export default TopProgressBar
