type RecapIntroProps = {
  year: number;
};

export function RecapIntro({ year }: RecapIntroProps) {
  return (
    <div className="h-full bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 flex items-center justify-center">
      <div className="text-center text-white px-8 animate-fade-in">
        <h1 className="text-7xl font-bold mb-8 animate-bounce-in">{year}</h1>
        <h2 className="text-4xl font-semibold mb-4">Your Year in Review</h2>
        <p className="text-xl opacity-90">A journey through your memories</p>
      </div>
    </div>
  );
}
