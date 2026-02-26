
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Home from './Home';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import BlogPage from './pages/BlogPage'; // Import the new BlogPage
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function App() {
  const [isBlogAlertOpen, setIsBlogAlertOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-primary">🎨 Color → Buy Coach</Link>
            <div className="flex items-center space-x-6">
              <Link to="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">About</Link>
              {/* Use Dialog for the Blog link */}
              <Dialog open={isBlogAlertOpen} onOpenChange={setIsBlogAlertOpen}>
                <DialogTrigger asChild>
                  <button className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Blog</button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Blog Coming Soon!</DialogTitle>
                    <DialogDescription>
                      We're working hard to bring you insightful articles, tips, and tutorials. Stay tuned!
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </nav>
        </header>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/blog" element={<BlogPage />} /> {/* Add route for BlogPage */}
          </Routes>
        </main>

        <footer className="bg-muted/40">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Color → Buy Coach. All rights reserved.</p>
                <nav className="flex space-x-4">
                    <Link to="/about" className="text-sm text-muted-foreground hover:text-primary">About</Link>
                    <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</a>
                </nav>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
