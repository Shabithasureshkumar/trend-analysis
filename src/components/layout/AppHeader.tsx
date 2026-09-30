import { useCallback, useId, useRef, useState } from 'react'
import patientAvatar from '../../assets/avatar.png'
import { PATIENT } from '../../data/insights'
import { useDismiss } from '../../hooks/useDismiss'
import { Icon } from '../ui/Icon'

export const PRIMARY_NAV = ['Dashboard', 'Appointment', 'Patient', 'Reports', 'Chats', 'Billing'] as const

interface AppHeaderProps {
  activePrimary: string
  onNavigate: (item: string) => void
  onOpenSettings: () => void
  query: string
  onQueryChange: (query: string) => void
}

const iconButton =
  'grid size-11 shrink-0 place-items-center rounded-full text-body transition-colors hover:bg-brand-purple-soft'

export function AppHeader({ activePrimary, onNavigate, onOpenSettings, query, onQueryChange }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const searchId = useId()

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const closeBell = useCallback(() => setBellOpen(false), [])
  useDismiss(menuRef, closeMenu, menuOpen)
  useDismiss(bellRef, closeBell, bellOpen)

  const toggleSearch = () => {
    if (searchOpen) onQueryChange('')
    setSearchOpen(!searchOpen)
  }

  return (
    <header className="relative z-30">
      <div className="flex items-center gap-2 lg:gap-4">
        <div ref={menuRef} className="relative lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Main menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            className="grid size-11 place-items-center rounded-full bg-gradient-to-r from-[#4b2fd8] to-[#6C4DE8] text-white shadow-[0_8px_18px_-6px_rgb(75_47_216/0.6)]"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="size-5" />
          </button>
          {menuOpen && (
            <nav
              id={menuId}
              aria-label="Main"
              className="absolute top-[calc(100%+10px)] left-0 z-40 w-[min(260px,calc(100vw-2rem))] rounded-3xl border border-line bg-white p-2 shadow-pop"
            >
              <ul>
                {PRIMARY_NAV.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      aria-current={activePrimary === item ? 'page' : undefined}
                      onClick={() => {
                        onNavigate(item)
                        setMenuOpen(false)
                      }}
                      className={`flex h-11 w-full items-center gap-3 rounded-2xl px-4 type-nav font-semibold ${
                        activePrimary === item
                          ? 'bg-gradient-to-r from-[#4b2fd8] to-[#6C4DE8] text-white'
                          : 'text-body hover:bg-brand-purple-soft'
                      }`}
                    >
                      {item === 'Dashboard' && <Icon name="grid" className="size-4" />}
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <nav
          aria-label="Main"
          className="hidden items-center gap-1 rounded-full border border-line bg-white/70 p-1.5 shadow-[0_6px_20px_-12px_rgb(120_80_200/0.35)] lg:flex"
        >
          {PRIMARY_NAV.map((item) => {
            const active = activePrimary === item
            return (
              <button
                key={item}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onNavigate(item)}
                className={`flex h-11 items-center gap-2 rounded-full px-5 type-nav font-semibold transition-colors ${
                  active
                    ? 'bg-gradient-to-r from-[#4b2fd8] to-[#6C4DE8] text-white shadow-[0_8px_18px_-6px_rgb(75_47_216/0.6)]'
                    : 'text-ink hover:bg-brand-purple-soft'
                }`}
              >
                {item === 'Dashboard' && <Icon name="grid" className="size-4" />}
                {item}
              </button>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleSearch}
            aria-label={searchOpen ? 'Close search' : 'Search metrics'}
            aria-expanded={searchOpen}
            aria-controls={searchId}
            className={`${iconButton} ${searchOpen ? 'bg-black/10' : ''}`}
          >
            <Icon name="search" className="size-[18px]" />
          </button>
          <button type="button" onClick={onOpenSettings} aria-label="Account settings" className={iconButton}>
            <Icon name="gear" className="size-[18px]" />
          </button>
          <div ref={bellRef} className="relative">
            <button
              type="button"
              onClick={() => setBellOpen(!bellOpen)}
              aria-label="Notifications"
              aria-expanded={bellOpen}
              className={iconButton}
            >
              <Icon name="bell" className="size-[18px]" />
            </button>
            {bellOpen && (
              <div
                role="status"
                className="absolute top-[calc(100%+10px)] right-0 z-40 w-[min(260px,calc(100vw-2rem))] rounded-3xl border border-line bg-white p-4 type-body shadow-pop"
              >
                <div className="font-semibold text-ink">Notifications</div>
                <p className="mt-1 text-muted">You&apos;re all caught up.</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2.5 pl-1 sm:pl-3">
            <img
              src={patientAvatar}
              alt={PATIENT.name}
              className="size-9 shrink-0 rounded-full bg-brand-pink-soft object-cover object-[50%_30%]"
            />
            <div className="hidden shrink-0 text-left leading-tight sm:block">
              <div className="truncate type-nav font-semibold text-ink">{PATIENT.name}</div>
              <div className="type-label whitespace-nowrap text-muted">Patient ID: {PATIENT.id}</div>
            </div>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div id={searchId} className="mt-3">
          <label htmlFor={`${searchId}-input`} className="sr-only">
            Search trend cards
          </label>
          <input
            id={`${searchId}-input`}
            autoFocus
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') toggleSearch()
            }}
            placeholder="Search trend cards, e.g. Sleep"
            className="h-11 w-full rounded-full border border-line bg-white px-5 type-body text-ink shadow-sm outline-none placeholder:text-muted focus:border-brand-purple sm:max-w-sm"
          />
        </div>
      )}
    </header>
  )
}
