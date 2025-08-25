import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackgroundRemover from '@/components/BackgroundRemover';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#000000' }}>
      <Header />
      <main className="flex-1">
        <BackgroundRemover />
      </main>
      <Footer />
    </div>
  );
}
