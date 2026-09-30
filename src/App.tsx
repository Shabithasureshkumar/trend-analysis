import { useState } from 'react'
import { slugify, useHashRoute } from './lib/route'
import { AppHeader, PRIMARY_NAV } from './components/layout/AppHeader'
import { CycleTabs, CYCLE_TABS } from './components/layout/CycleTabs'
import { PageBrand } from './components/layout/PageBrand'
import { InsightsPage } from './components/insights/InsightsPage'

const HOME = 'Dashboard'
const DEFAULT_TAB = 'Insights'
const SETTINGS_PAGE = 'Account settings'

const PAGES = [...PRIMARY_NAV, SETTINGS_PAGE]

export default function App() {
  const [slug, navigate] = useHashRoute()
  const [query, setQuery] = useState('')

  const cycleTab = CYCLE_TABS.find((label) => slugify(label) === slug)
  const primaryPage = PAGES.find((label) => slugify(label) === slug)
  const tab = cycleTab ?? (primaryPage && primaryPage !== HOME ? '' : DEFAULT_TAB)
  const primary = primaryPage ?? HOME

  const showInsights = tab === DEFAULT_TAB
  const unavailableName = tab || primary

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[radial-gradient(60rem_30rem_at_0%_0%,#FFF0F6_0%,transparent_60%),radial-gradient(50rem_28rem_at_100%_10%,#efeaff_0%,transparent_60%)]">
      <div className="px-4 pt-4 pb-12 sm:px-6 sm:pt-5 lg:px-11">
        <AppHeader
          activePrimary={tab ? HOME : primary}
          onNavigate={(item) => navigate(slugify(item))}
          onOpenSettings={() => navigate(slugify(SETTINGS_PAGE))}
          query={query}
          onQueryChange={setQuery}
        />
        <PageBrand />
        <CycleTabs
          active={tab}
          onSelect={(next) => navigate(slugify(next))}
        />
        <main>
          {showInsights ? (
            <InsightsPage query={query} />
          ) : (
            <section
              aria-labelledby="unavailable-title"
              className="mt-8 rounded-[28px] border border-line bg-white p-8 text-center shadow-card"
            >
              <h2 id="unavailable-title" className="type-section font-bold text-ink">
                {unavailableName}
              </h2>
              <p className="mt-2 type-body text-muted">
                This section isn&apos;t part of this project yet. Only the Insights page is implemented.
              </p>
              <button
                type="button"
                onClick={() => navigate(slugify(DEFAULT_TAB))}
                className="mt-5 h-11 rounded-full bg-gradient-to-r from-[#4b2fd8] to-[#6C4DE8] px-6 type-button font-semibold text-white"
              >
                Back to Insights
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
