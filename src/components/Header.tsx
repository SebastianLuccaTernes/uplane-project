export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Background Remover and Flipper
            </h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="https://github.com/SebastianLuccaTernes" className="text-gray-500 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
