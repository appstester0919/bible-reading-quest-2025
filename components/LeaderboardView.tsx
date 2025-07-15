'use client'

import Image from 'next/image';

interface LeaderboardEntry {
  username: string | null;
  avatar_url: string | null;
  completed_books_count: number;
}

interface LeaderboardViewProps {
  data: LeaderboardEntry[];
}

// 賽跑道的里程碑 - 每3卷為一個階段
const MILESTONES = [
  { books: 66, label: '🏆 完賽榮耀', emoji: '🏆', color: 'bg-yellow-400', textColor: 'text-yellow-800' },
  { books: 63, label: '🎯 最後衝刺', emoji: '🎯', color: 'bg-red-400', textColor: 'text-red-800' },
  { books: 60, label: '⚡ 終點在望', emoji: '⚡', color: 'bg-orange-400', textColor: 'text-orange-800' },
  { books: 57, label: '🔥 全力以赴', emoji: '🔥', color: 'bg-pink-400', textColor: 'text-pink-800' },
  { books: 54, label: '💪 堅持不懈', emoji: '💪', color: 'bg-purple-400', textColor: 'text-purple-800' },
  { books: 51, label: '🌟 越戰越勇', emoji: '🌟', color: 'bg-indigo-400', textColor: 'text-indigo-800' },
  { books: 48, label: '🚀 加速前進', emoji: '🚀', color: 'bg-blue-400', textColor: 'text-blue-800' },
  { books: 45, label: '⭐ 穩步向前', emoji: '⭐', color: 'bg-cyan-400', textColor: 'text-cyan-800' },
  { books: 42, label: '🎨 創意滿滿', emoji: '🎨', color: 'bg-teal-400', textColor: 'text-teal-800' },
  { books: 39, label: '📚 知識豐富', emoji: '📚', color: 'bg-green-400', textColor: 'text-green-800' },
  { books: 36, label: '🌈 多彩人生', emoji: '🌈', color: 'bg-lime-400', textColor: 'text-lime-800' },
  { books: 33, label: '🎵 和諧旋律', emoji: '🎵', color: 'bg-yellow-400', textColor: 'text-yellow-800' },
  { books: 30, label: '🌸 美好綻放', emoji: '🌸', color: 'bg-rose-400', textColor: 'text-rose-800' },
  { books: 27, label: '🎪 精彩表演', emoji: '🎪', color: 'bg-orange-400', textColor: 'text-orange-800' },
  { books: 24, label: '🎭 角色扮演', emoji: '🎭', color: 'bg-red-400', textColor: 'text-red-800' },
  { books: 21, label: '🎯 目標明確', emoji: '🎯', color: 'bg-pink-400', textColor: 'text-pink-800' },
  { books: 18, label: '🎨 藝術創作', emoji: '🎨', color: 'bg-purple-400', textColor: 'text-purple-800' },
  { books: 15, label: '🌟 閃閃發光', emoji: '🌟', color: 'bg-indigo-400', textColor: 'text-indigo-800' },
  { books: 12, label: '🚀 火箭升空', emoji: '🚀', color: 'bg-blue-400', textColor: 'text-blue-800' },
  { books: 9, label: '🌱 茁壯成長', emoji: '🌱', color: 'bg-green-400', textColor: 'text-green-800' },
  { books: 6, label: '🎈 輕鬆愉快', emoji: '🎈', color: 'bg-cyan-400', textColor: 'text-cyan-800' },
  { books: 3, label: '🌅 初露曙光', emoji: '🌅', color: 'bg-yellow-300', textColor: 'text-yellow-800' },
  { books: 0, label: '🚀 起跑線', emoji: '🚀', color: 'bg-gray-400', textColor: 'text-gray-800' },
];

export default function LeaderboardView({ data }: LeaderboardViewProps) {
  // 按完成書卷數排序
  const sortedData = [...data].sort((a, b) => b.completed_books_count - a.completed_books_count);

  const getMilestone = (count: number) => {
    return MILESTONES.find(m => count >= m.books) || MILESTONES[MILESTONES.length - 1];
  };

  return (
    <div className="w-full">
      {/* Goal Banner - 終點線 */}
      <div className="relative mb-6">
        <div className="bg-gradient-to-r from-red-600 via-white to-red-600 p-4 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-800 mb-2">🏁 GOAL 🏁</div>
            <div className="text-lg font-semibold text-gray-800">完成66卷聖經，跑完讀經循環賽一次</div>
          </div>
        </div>
        {/* 終點線條紋 */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-black via-white to-black opacity-60 rounded-b-lg"></div>
      </div>

      {/* 200米賽跑場 */}
      <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(to bottom, #dc2626, #b91c1c, #dc2626)' }}>
        {/* 賽道背景 - 橘紅色跑道 */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #fb923c, #f97316, #fb923c)' }}></div>
        
        {/* 跑道邊界線 */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white"></div>
        
        {/* 跑道分隔線 */}
        <div className="absolute left-0 right-0 top-0 bottom-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-0.5 bg-white opacity-80"
              style={{ top: `${(i + 1) * 11.11}%` }}
            ></div>
          ))}
        </div>

        {/* 跑道車道線 - 虛線 */}
        <div className="absolute left-0 right-0 top-0 bottom-0">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t-2 border-dashed border-white opacity-60"
              style={{ top: `${(i + 1) * 12.5}%` }}
            ></div>
          ))}
        </div>

        <div className="relative space-y-3 p-4">
          {MILESTONES.map((milestone, index) => {
            const usersAtMilestone = sortedData.filter(user => {
              if (milestone.books === 66) {
                // 最後一個里程碑，只包含完成66卷的用戶
                return user.completed_books_count === 66;
              } else {
                // 其他里程碑，包含該範圍內的用戶
                const rangeStart = milestone.books;
                const rangeEnd = milestone.books + 2;
                return user.completed_books_count >= rangeStart && user.completed_books_count <= rangeEnd;
              }
            });

            return (
              <div key={milestone.books} className="flex items-center gap-3 min-h-[64px] relative">{/* 增加高度以容納48px頭像 */}
                {/* 左側跑道邊界 */}
                <div className="w-2 h-full bg-white rounded-l"></div>
                
                {/* 里程碑標記 - 跑道風格 */}
                <div className={`flex-shrink-0 w-24 h-12 ${milestone.color} rounded flex flex-col items-center justify-center shadow-md border border-white`}>{/* 增加高度 */}
                  <div className="text-lg">{milestone.emoji}</div>
                  <div className={`text-xs font-bold ${milestone.textColor} whitespace-nowrap w-full text-center`}>
                    {milestone.books === 66 ? '66' : 
                     milestone.books === 0 ? '0-2' : 
                     `${milestone.books}-${milestone.books + 2}`}
                  </div>
                </div>

                {/* 跑者區域 - 跑道中央 */}
                <div className="flex-1 min-h-[40px] bg-gradient-to-r from-orange-400/20 via-red-400/20 to-orange-400/20 rounded p-1 flex items-center gap-1 overflow-x-auto border-t border-b border-white/30">
                  {usersAtMilestone.length > 0 ? (
                    usersAtMilestone.map((user, userIndex) => (
                      <div key={userIndex} className="flex-shrink-0 group relative">
                        <div className="flex items-center relative">
                          {/* 跑者頭像 - 純圖標風格 */}
                          {user.avatar_url ? (
                            <Image 
                              src={user.avatar_url} 
                              alt={user.username || 'avatar'} 
                              className="rounded-full border-2 border-white shadow-md hover:scale-125 transition-all duration-200" 
                              width={48} 
                              height={48}
                              unoptimized={true}
                              onError={(e) => {
                                // 如果圖片載入失敗，隱藏圖片並顯示備用頭像
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white text-lg font-bold shadow-md border-2 border-white hover:scale-125 transition-all duration-200" 
                            style={{ 
                              width: '48px', 
                              height: '48px',
                              display: user.avatar_url ? 'none' : 'flex'
                            }}
                          >
                            {user.username?.charAt(0).toUpperCase() || '🏃'}
                          </div>

                          {/* 冠軍標記 - 增大 */}
                          {userIndex === 0 && index === 0 && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-lg font-bold text-yellow-800 border border-white shadow-md animate-pulse">
                              👑
                            </div>
                          )}
                        </div>

                        {/* 懸停提示 - 簡化資訊卡 */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20">
                          <div className="font-semibold">{user.username || '匿名跑者'}</div>
                          <div>{user.completed_books_count} 卷聖經</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-black"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/60 text-sm italic flex items-center justify-center w-full">
                      <span className="text-xl mr-2">🏃‍♂️</span>
                      等待跑者到達
                    </div>
                  )}
                </div>

                {/* 右側跑道邊界 */}
                <div className="w-2 h-full bg-white rounded-r"></div>
              </div>
            );
          })}
        </div>

        {/* 起跑線 */}
        <div className="relative mt-4 p-4 bg-gradient-to-r from-green-600 via-white to-green-600 rounded-b-lg border-4 border-green-600">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800 mb-1">🚀 START LINE 🚀</div>
            <div className="text-sm font-semibold text-gray-800">開始您的讀經之旅</div>
          </div>
        </div>
      </div>

      {/* 統計資訊 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{sortedData.length}</div>
          <div className="text-sm text-gray-600">總參賽者</div>
        </div>
        <div className="bg-white/80 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {sortedData.filter(u => u.completed_books_count === 66).length}
          </div>
          <div className="text-sm text-gray-600">完賽者</div>
        </div>
        <div className="bg-white/80 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {sortedData.length > 0 ? Math.round(sortedData.reduce((sum, u) => sum + u.completed_books_count, 0) / sortedData.length) : 0}
          </div>
          <div className="text-sm text-gray-600">平均進度</div>
        </div>
        <div className="bg-white/80 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {sortedData.length > 0 ? sortedData[0].completed_books_count : 0}
          </div>
          <div className="text-sm text-gray-600">領先進度</div>
        </div>
      </div>
    </div>
  );
}
