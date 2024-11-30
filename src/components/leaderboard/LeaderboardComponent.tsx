import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js';

const LeaderboardComponent: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<{ userId: string; score: number }[]>([]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    });

    const channel = pusher.subscribe('leaderboard-channel');
    channel.bind('update', (data: { userId: string; score: number }) => {
      setLeaderboard((prevLeaderboard) => {
        const updatedLeaderboard = [...prevLeaderboard];
        const userIndex = updatedLeaderboard.findIndex(user => user.userId === data.userId);
        if (userIndex !== -1) {
          updatedLeaderboard[userIndex].score = data.score;
        } else {
          updatedLeaderboard.push(data);
        }
        return updatedLeaderboard.sort((a, b) => b.score - a.score);
      });
    });

    return () => {
      pusher.unsubscribe('leaderboard-channel');
    };
  }, []);

  return (
    <div className="leaderboard-component">
      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map((user, index) => (
          <li key={index}>
            {user.userId}: {user.score} points
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaderboardComponent;
