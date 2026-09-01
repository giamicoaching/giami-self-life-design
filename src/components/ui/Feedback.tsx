import type { Ref } from 'react'

interface CompleteBannerProps {
  visible: boolean
  bannerRef?: Ref<HTMLElement>
}

export function CompleteBanner({ visible, bannerRef }: CompleteBannerProps) {
  if (!visible) return null
  return (
    <section
      ref={bannerRef}
      className="complete-banner"
      tabIndex={-1}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <h2>자기주도 생애설계를 완료했습니다.</h2>
      <p>정한 시점에 첫 행동을 시작하고, 필요할 때 이 계획을 다시 살펴보세요.</p>
    </section>
  )
}
