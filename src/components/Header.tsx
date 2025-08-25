export default function Header() {
  return (
    <header className="bg-gray-900 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-100">
              Background Remover and Flipper
            </h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="https://github.com/SebastianLuccaTernes" className="text-gray-400 hover:text-gray-100 transition-colors">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
