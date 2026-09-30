import calendarIllustration from '../../assets/header_calendar.png'
import patientAvatar from '../../assets/avatar.png'
import { PATIENT } from '../../data/insights'

export function PageBrand() {
  return (
    <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <img
          src={calendarIllustration}
          alt="Cycle tracker calendar illustration"
          className="h-auto w-[84px] shrink-0 object-contain mix-blend-multiply [image-rendering:-webkit-optimize-contrast] sm:w-[120px]"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 type-label font-bold tracking-[0.22em] text-brand-pink ">
            PERIOD
            <span className="h-[2px] w-16 rounded-full bg-brand-pink/70 sm:w-28" aria-hidden="true" />
          </div>
          <h1 className="type-page font-bold text-ink">
            Cycle <span className="text-brand-pink">Tracker</span>
          </h1>
          <p className="mt-1 type-secondary text-muted ">Understand your body, one day at a time.</p>
        </div>
      </div>

      <section
        aria-label="Patient summary"
        className="relative h-[135px] w-full max-w-[364px] shrink-0 overflow-hidden rounded-[25.69px] bg-gradient-to-br from-[#FF78BE] to-[#CE35A8] p-[21.4px] text-white shadow-[0_18px_36px_-14px_rgb(206_53_168/0.55)] lg:w-[364px]"
      >
        <div className="relative z-10 max-w-[60%]">
          <div className="type-patient-name font-bold italic ">{PATIENT.name}</div>
          <ul className="mt-1 type-patient-detail text-white/85 max-[413px]:text-[10px]">
            {PATIENT.details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="absolute -right-3 -bottom-8 size-[150px] rounded-full bg-[#c22a7a]" aria-hidden="true" />
        <img
          src={patientAvatar}
          alt={`${PATIENT.name}, patient`}
          className="absolute -right-3.5 bottom-0 h-[104px] w-auto object-contain min-[414px]:right-3 min-[414px]:h-[118px]"
        />
      </section>
    </div>
  )
}
