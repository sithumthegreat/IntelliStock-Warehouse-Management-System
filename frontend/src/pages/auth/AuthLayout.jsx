import warehouse from '../../assets/warehouse.jpeg'

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.08fr_1fr]">
      <aside
        className="relative hidden overflow-hidden bg-[#0d2f66] bg-cover bg-center text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-end"
        style={{ backgroundImage: `url(${warehouse})` }}
      >
        {/* Dark blue overlay so the text stays readable over the photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a2150]/95 via-[#0d2f66]/45 to-[#0d2f66]/10" />

        <div className="relative z-10 max-w-[520px] px-14 pb-14">
          <h2 className="mb-2.5 text-[34px] font-extrabold leading-tight tracking-tight">
            Stock the right amount, at the right time
          </h2>
          <p className="text-[15px] leading-relaxed text-[#d6e6ff]">
            Forecast demand, set reorder points and follow every purchase order in one workspace.
          </p>
        </div>
      </aside>

      <main className="flex items-start justify-center px-5 py-8 lg:items-center lg:px-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-[38px] place-items-center rounded-[10px] bg-[#1677ff] font-extrabold text-white">
              IS
            </div>
            <div>
              <b>IntelliStock</b>
              <small className="mt-1 block text-[8px] tracking-[1px] text-[#8794a6]">
                INVENTORY INTELLIGENCE
              </small>
            </div>
          </div>
          {children}
          <p className="mt-6 text-[11px] text-[#8794a6]">
            © 2026 IntelliStock · University project prototype
          </p>
        </div>
      </main>
    </div>
  )
}