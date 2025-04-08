import { useEffect, useState } from 'react';
import { client } from '../../lib/sanity';

interface Gig {
  _id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  status: string;
  requesterName: string;
  location: string;
  estimatedHours: number;
  dueDate: string;
  skills: string[];
  createdAt: string;
}

export default function StackrGigs() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGigs() {
      try {
        setLoading(true);
      
      try {
        const query = `*[_type == "gig" && status == "open"] | order(createdAt desc) {
          _id,
          title,
          description,
          amount,
          category,
          status,
          requesterName,
          location,
          estimatedHours,
          dueDate,
          skills,
          createdAt
        }`;

        const result = await client.fetch(query);
        setGigs(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch gigs');
        setLoading(false);
      }
    }

    fetchGigs();
  }, []);

  if (loading) return <div>Loading gigs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Available Gigs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gigs.map((gig) => (
          <div key={gig._id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{gig.title}</h2>
            <p className="text-gray-600 mb-4">{gig.description}</p>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">${gig.amount}</span>
              <span className="text-sm text-gray-500">{gig.estimatedHours}h</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {gig.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">{gig.location}</span>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}