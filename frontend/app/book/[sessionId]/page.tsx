'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getBook } from '../../lib/api';

interface BookData {
  sessionId: string;
  createdAt: string;
  completedAt: string;
  storyType: string;
  kidPhotoUrl: string;
  pages: Array<{
    pageNumber: number;
    storyText: string;
    educationalConcept: string;
    panel1Url: string | null;
    panel2Url: string | null;
    kidResponse: string | null;
  }>;
  choices: Array<{
    pageNumber: number;
    choice: string;
    wasDefault: boolean;
  }>;
  totalPages: number;
}

export default function BookPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get full image URL
  const getFullImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${apiUrl}${url}`;
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await getBook(sessionId);
        if (response.success) {
          // Normalize image URLs
          const normalizedBook = {
            ...response.book,
            pages: response.book.pages.map((page: any) => ({
              ...page,
              panel1Url: getFullImageUrl(page.panel1Url),
              panel2Url: getFullImageUrl(page.panel2Url),
            })),
          };
          setBook(normalizedBook);
        }
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [sessionId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Space Adventure with Hey Verne!',
        text: 'Check out my space adventure!',
        url: window.location.href
      });
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <p className="text-xl">Loading your adventure book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl">Book not found</p>
          <a href="/" className="text-blue-300 underline mt-4 block">
            Start a new adventure
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print-friendly styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>

      {/* Header - No Print */}
      <div className="no-print bg-gradient-to-r from-blue-900 to-purple-900 text-white py-6 px-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">🚀 Your Space Adventure</h1>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
            >
              📤 Share
            </button>
            <button
              onClick={handlePrint}
              className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              🖨️ Print
            </button>
            <a
              href="/"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-500 transition-colors"
            >
              🏠 Home
            </a>
          </div>
        </div>
      </div>

      {/* Book Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8 print:py-0">
        {/* Cover Page */}
        <div className="mb-12 text-center page-break-after">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-3xl p-12 shadow-2xl print:shadow-none">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              My Space Adventure
            </h2>
            <div className="text-3xl mb-6">🚀 ⭐ 🪐</div>
            {book.kidPhotoUrl && (
              <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-yellow-400 mb-6">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${book.kidPhotoUrl}`}
                  alt="Space Explorer"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <p className="text-xl">Featuring: The Brave Space Explorer</p>
            <p className="text-lg mt-4 text-yellow-300">
              With Captain Verne as your guide
            </p>
            <p className="text-sm mt-6 text-gray-200">
              {new Date(book.completedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Story Pages */}
        {book.pages
          .filter(page => page.pageNumber >= 2) // Skip intro page
          .map((page, idx) => (
            <div
              key={page.pageNumber}
              className="mb-12 page-break-after"
            >
              {/* Page Number */}
              <div className="text-center mb-6">
                <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-lg font-bold print:bg-gray-800">
                  Page {page.pageNumber}
                </span>
              </div>

              {/* Comic Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {page.panel1Url && (
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-4 border-gray-300 print:border-2">
                    <Image
                      src={page.panel1Url}
                      alt={`Page ${page.pageNumber} Panel 1`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {page.panel2Url && (
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-4 border-gray-300 print:border-2">
                    <Image
                      src={page.panel2Url}
                      alt={`Page ${page.pageNumber} Panel 2`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Story Text */}
              <div className="bg-blue-50 rounded-2xl p-6 print:bg-white print:border print:border-gray-300">
                <p className="text-gray-800 text-lg leading-relaxed">
                  {page.storyText}
                </p>
                {page.kidResponse && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-blue-600 italic">
                      <span className="font-semibold">You said:</span> "{page.kidResponse}"
                    </p>
                  </div>
                )}
              </div>

              {/* Educational Concept Badge */}
              {page.educationalConcept && (
                <div className="mt-4 text-center">
                  <span className="inline-block bg-yellow-400 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold print:bg-gray-200">
                    🎓 Learned: {page.educationalConcept.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          ))}

        {/* End Page */}
        <div className="mb-12 text-center page-break-before">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-3xl p-12 shadow-2xl print:shadow-none print:border print:border-gray-300">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The End
            </h2>
            <div className="text-6xl mb-6">🌟 🏆 🎉</div>
            <p className="text-xl mb-4">
              Congratulations, Space Explorer!
            </p>
            <p className="text-lg text-gray-100">
              You've completed an amazing adventure and learned so much about space!
            </p>
            
            {/* Summary of Learnings */}
            <div className="mt-8 bg-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-semibold mb-4">What You Learned:</h3>
              <ul className="text-left max-w-md mx-auto space-y-2">
                <li className="flex items-start gap-2">
                  <span>✨</span>
                  <span>The solar system has 8 planets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>☀️</span>
                  <span>The sun is a star that gives us light and heat</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🌍</span>
                  <span>Gravity keeps planets in orbit</span>
                </li>
              </ul>
            </div>

            <p className="text-sm mt-6 text-yellow-300">
              Created with Hey Verne! 🚀
            </p>
          </div>
        </div>

        {/* Share Section - No Print */}
        <div className="no-print text-center mb-12">
          <div className="bg-gray-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Share Your Adventure!
            </h3>
            <p className="text-gray-600 mb-6">
              Show your friends and family your amazing space journey
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleShare}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
              >
                📤 Share Link
              </button>
              <button
                onClick={handlePrint}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-500 transition-colors"
              >
                🖨️ Print Book
              </button>
            </div>
          </div>
        </div>

        {/* New Adventure Button - No Print */}
        <div className="no-print text-center mb-12">
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-500 hover:to-purple-500 transition-all transform hover:scale-105"
          >
            🚀 Start Another Adventure
          </a>
        </div>
      </div>
    </div>
  );
}

