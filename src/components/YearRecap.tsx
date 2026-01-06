import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Share2, Download } from 'lucide-react';
import { getFullYearRecap, YearRecapData } from '../lib/recapService';
import { RecapIntro } from './recap/RecapIntro';
import { RecapStats } from './recap/RecapStats';
import { RecapLocations } from './recap/RecapLocations';
import { RecapPhotos } from './recap/RecapPhotos';
import { RecapTrips } from './recap/RecapTrips';
import { RecapEngagement } from './recap/RecapEngagement';
import { RecapTimeline } from './recap/RecapTimeline';
import { RecapOutro } from './recap/RecapOutro';

type YearRecapProps = {
  userId: string;
  year: number;
  onClose: () => void;
};

export function YearRecap({ userId, year, onClose }: YearRecapProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [recapData, setRecapData] = useState<YearRecapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecapData();
  }, [userId, year]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const loadRecapData = async () => {
    setLoading(true);
    const data = await getFullYearRecap(userId, year);
    setRecapData(data);
    setLoading(false);
  };

  const nextSlide = () => {
    if (recapData && currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/recap/${userId}/${year}`;
    if (navigator.share) {
      navigator.share({
        title: `My ${year} Year in Review`,
        text: `Check out my ${year} travel recap!`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center z-50">
        <div className="text-white text-2xl animate-pulse">Loading your {year} recap...</div>
      </div>
    );
  }

  if (!recapData) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center z-50">
        <div className="text-white text-center">
          <h2 className="text-3xl font-bold mb-4">No data found</h2>
          <p className="text-lg mb-6">You don't have any logs for {year} yet.</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const slides = [
    <RecapIntro key="intro" year={year} />,
    <RecapStats key="stats" stats={recapData.stats} year={year} />,
    <RecapLocations key="locations" locations={recapData.allLocations} topLocation={recapData.stats.top_location} topLocationCount={recapData.stats.top_location_count} />,
    <RecapTrips key="trips" trips={recapData.allTrips} />,
    <RecapTimeline key="timeline" monthBreakdown={recapData.stats.month_breakdown} busiestMonth={recapData.stats.busiest_month} />,
    <RecapPhotos key="photos" photos={recapData.photoHighlights} totalPhotos={recapData.stats.total_photos} />,
    <RecapEngagement key="engagement" likes={recapData.stats.total_likes} comments={recapData.stats.total_comments} topPosts={recapData.topPosts} />,
    <RecapOutro key="outro" year={year} stats={recapData.stats} />
  ];

  return (
    <div className="fixed inset-0 bg-black z-50">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/10 p-2 rounded-full transition"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute top-4 right-16 z-10 flex gap-2">
        <button
          onClick={handleShare}
          className="text-white hover:bg-white/10 p-2 rounded-full transition"
          title="Share"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      <div className="h-2 bg-gray-800 absolute top-0 left-0 right-0 z-10">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        {currentSlide > 0 && (
          <button
            onClick={prevSlide}
            className="text-white hover:bg-white/10 p-3 rounded-full transition"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
        {currentSlide < slides.length - 1 && (
          <button
            onClick={nextSlide}
            className="text-white hover:bg-white/10 p-3 rounded-full transition"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>

      <div className="w-full h-full overflow-hidden">
        <div
          className="h-full flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full h-full flex-shrink-0">
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
