export function AuthHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <img 
          src="/logo-marca-completa-clara.png" 
          alt="IAplicada" 
          className="h-8"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        
        {/* Links de navegação */}
        <nav className="flex items-center gap-8">
          <a 
            href="/aplique" 
            className="text-white/60 hover:text-white transition-colors text-sm font-medium"
          >
            Sobre
          </a>
          <a 
            href="/avance" 
            className="text-white/60 hover:text-white transition-colors text-sm font-medium"
          >
            Serviços
          </a>
        </nav>
      </div>
    </header>
  );
}
