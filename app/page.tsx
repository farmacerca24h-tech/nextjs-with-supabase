export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fffe]">
      <header className="max-w-6xl mx-auto p-6 flex justify-between">
        <div className="flex items-center gap-2 font-black text-xl">
          <div className="bg-emerald-500 text-white w-8 h-8 rounded-lg flex items-center justify-center">+</div>
          Farmacerca24h
        </div>
        <div className="text-sm text-gray-400">Beta - Almería</div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight">
          Encuentra tu farmacia<br/>
          <span className="text-emerald-500">de guardia en 5 segundos</span>
        </h1>
        <p className="mt-6 text-gray-500 text-xl">En Urrácal, Purchena, Olula y toda la comarca.</p>

        <div className="mt-10 max-w-2xl mx-auto flex gap-2 p-2 bg-white rounded-[20px] shadow-2xl shadow-emerald-100 border">
          <input className="flex-1 px-6 py-4 outline-none rounded-xl text-lg" placeholder="¿En qué pueblo estás? Ej: Urrácal" />
          <button className="bg-emerald-500 text-white px-8 rounded-xl font-bold">Buscar</button>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-4 text-left">
          <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500">
            <span className="text-xs font-bold bg-emerald-500 text-white px-3 py-1 rounded-full">DE GUARDIA HOY</span>
            <h3 className="font-bold text-lg mt-3">Farmacia Liria - Purchena</h3>
            <p className="text-sm text-gray-500">Abierta hasta 22:00 - 650m de ti</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border">
            <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full">CERCANA</span>
            <h3 className="font-bold text-lg mt-3">Farmacia Urrácal</h3>
            <p className="text-sm text-gray-500">Abre mañana 9:30</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border">
            <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full">CERCANA</span>
            <h3 className="font-bold text-lg mt-3">Farmacia Central Olula</h3>
            <p className="text-sm text-gray-500">Abre mañana 9:00</p>
          </div>
        </div>
      </div>
    </main>
  )
}
