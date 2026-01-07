import { useParams, useNavigate } from 'react-router-dom';
import { YearRecap } from './YearRecap';

export function PublicRecap() {
  const { userId, year } = useParams<{ userId: string; year: string }>();
  const navigate = useNavigate();

  if (!userId || !year) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Invalid Recap URL</h2>
          <p className="text-slate-600">The recap URL is invalid or incomplete.</p>
        </div>
      </div>
    );
  }

  return (
    <YearRecap
      userId={userId}
      year={parseInt(year)}
      onClose={() => navigate('/')}
    />
  );
}
