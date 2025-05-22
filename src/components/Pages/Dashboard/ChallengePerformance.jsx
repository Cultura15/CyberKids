import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp } from 'lucide-react';

export default function ChallengePerformance({ scores, timers, selectedChallenge, challengeNames }) {
  // Format data for the score distribution chart
  const formatScoreDistribution = () => {
    const filteredScores = scores.filter(score => 
      (selectedChallenge === 'ALL' || score.challengeType === selectedChallenge)
    );
    
    const distribution = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 }
    ];

    filteredScores.forEach(score => {
      const points = score.points;
      if (points <= 20) distribution[0].count++;
      else if (points <= 40) distribution[1].count++;
      else if (points <= 60) distribution[2].count++;
      else if (points <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    return distribution;
  };

  // Calculate average completion time
  const calculateAverageTime = () => {
    const filteredTimers = timers.filter(timer => 
      (selectedChallenge === 'ALL' || timer.challengeType === selectedChallenge) && timer.timeTaken
    );
    
    if (filteredTimers.length === 0) return 'No data';
    
    // Assuming timeTaken is in format "X minutes Y seconds"
    let totalSeconds = 0;
    filteredTimers.forEach(timer => {
      const timeParts = timer.timeTaken.split(' ');
      const minutes = parseInt(timeParts[0]) || 0;
      const seconds = parseInt(timeParts[2]) || 0;
      totalSeconds += minutes * 60 + seconds;
    });
    
    const avgSeconds = Math.round(totalSeconds / filteredTimers.length);
    const avgMinutes = Math.floor(avgSeconds / 60);
    const remainingSeconds = avgSeconds % 60;
    
    return `${avgMinutes} minutes ${remainingSeconds} seconds`;
  };

  // Calculate percentage of students who completed the challenge
  const calculateCompletionRate = () => {
    const filteredScores = scores.filter(score => 
      (selectedChallenge === 'ALL' || score.challengeType === selectedChallenge)
    );
    
    if (filteredScores.length === 0) return '0%';
    
    const completed = filteredScores.filter(score => score.completionStatus === 'Completed').length;
    return `${Math.round((completed / filteredScores.length) * 100)}%`;
  };

  const scoreDistributionData = formatScoreDistribution();
  const averageTime = calculateAverageTime();
  const completionRate = calculateCompletionRate();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">Completion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{completionRate}</p>
          <p className="text-sm text-gray-500 mt-1">Students who completed the challenge</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">Average Time</h3>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{averageTime}</p>
          <p className="text-sm text-gray-500 mt-1">Average completion time</p>
        </div>
      </div>
      
      {/* Score Distribution Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Score Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Number of Students" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Scores Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Student Scores by Challenge</h3>
          {scores.filter(score => selectedChallenge === 'ALL' || score.challengeType === selectedChallenge).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challenge</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scores
                    .filter(score => selectedChallenge === 'ALL' || score.challengeType === selectedChallenge)
                    .slice(0, 10) // Show only 10 records for performance
                    .map((score) => (
                      <tr key={score.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{score.student.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {challengeNames[score.challengeType] || score.challengeType}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            score.points >= 80 ? 'bg-green-100 text-green-800' :
                            score.points >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {score.points}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            score.completionStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                            score.completionStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {score.completionStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No score data available for the selected challenge.
            </div>
          )}
        </div>
    
        {/* Completion Times Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Completion Times</h3>
          {timers.filter(timer => (selectedChallenge === 'ALL' || timer.challengeType === selectedChallenge) && timer.timeTaken).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challenge</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timers
                    .filter(timer => (selectedChallenge === 'ALL' || timer.challengeType === selectedChallenge) && timer.timeTaken)
                    .slice(0, 10) // Show only 10 records for performance
                    .map((timer) => (
                      <tr key={timer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{timer.student.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {challengeNames[timer.challengeType] || timer.challengeType}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{timer.timeTaken}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(timer.endTime).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No completion time data available for the selected challenge.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}