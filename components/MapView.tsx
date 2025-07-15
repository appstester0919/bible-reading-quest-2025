'use client'

import { useEffect, useState } from 'react'
import { ALL_BOOKS } from '@/lib/bibleData'
import Modal from './ui/Modal'

interface MapViewProps {
  completedBooks: string[];
  showEncouragement: boolean;
  showFireworks: boolean;
}

interface TerritoryPiece {
  id: number;
  book: typeof ALL_BOOKS[0];
  x: number;
  y: number;
  width: number;
  height: number;
  isNewlyCompleted: boolean;
}

// Generate simplified territory grid (same layout as original)
const generateTerritoryGrid = (): TerritoryPiece[] => {
  const grid: TerritoryPiece[] = []
  const cols = 6  // 橫向6格
  const rows = 11 // 直向11格
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col
      if (index < 66) { // 只生成66塊
        grid.push({
          id: index,
          book: ALL_BOOKS[index],
          x: (col / cols) * 100,
          y: (row / rows) * 100,
          width: 100 / cols,
          height: 100 / rows,
          isNewlyCompleted: false
        })
      }
    }
  }
  return grid
}

// Simplified territory piece component - iOS safe
function TerritoryPiece({ 
  piece, 
  isCompleted 
}: { 
  piece: TerritoryPiece; 
  isCompleted: boolean;
}) {
  // Simple puzzle-like effect using borders and pseudo-elements
  const puzzleStyle = {
    position: 'absolute' as const,
    left: `${piece.x}%`,
    top: `${piece.y}%`,
    width: `${piece.width}%`,
    height: `${piece.height}%`,
    transition: 'all 0.3s ease',
    
    // Core 得地 effect: transparency to reveal map underneath
    background: isCompleted 
      ? 'rgba(255, 255, 255, 0.05)'  // Almost transparent = 得地!
      : 'rgba(200, 200, 200, 0.95)', // Opaque = 未得地
      
    // Simple border instead of complex clipPath
    border: isCompleted 
      ? '2px solid rgba(34, 197, 94, 0.9)' 
      : '2px solid rgba(120, 120, 120, 0.9)',
      
    // Soft rounded corners - safe for iOS
    borderRadius: '6px',
    
    // Add subtle shadow for depth
    boxShadow: isCompleted 
      ? '0 0 10px rgba(34, 197, 94, 0.6)' 
      : '0 2px 8px rgba(0, 0, 0, 0.3)',
      
    // Animation for newly completed territories
    ...(piece.isNewlyCompleted && {
      animation: 'territory-conquest 1.5s ease-out'
    })
  }

  return (
    <div
      style={puzzleStyle}
      className="cursor-pointer group"
      title={`${piece.book.name} (${piece.book.chapters}章) ${isCompleted ? '(已得地)' : '(未得地)'}`}
    >
      {/* Territory content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
        {/* Book name */}
        <div className={`text-center text-xs font-bold leading-tight ${
          isCompleted 
            ? 'text-white drop-shadow-lg' // White text for completed territories
            : 'text-gray-700' // Dark text for incomplete territories
        }`}>
          {piece.book.name.length > 6 
            ? piece.book.name.substring(0, 4) + '...' 
            : piece.book.name
          }
        </div>
        
        {/* Completion marker */}
        {isCompleted && (
          <div className="text-white text-lg font-bold drop-shadow-lg mt-1">✓</div>
        )}
      </div>

      {/* Hover tooltip */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20 pointer-events-none">
        {piece.book.name} ({piece.book.chapters}章)
      </div>

      {/* Simple puzzle connection points using pseudo-elements */}
      <div 
        className="absolute w-3 h-3 bg-current rounded-full opacity-30"
        style={{
          top: '10%',
          right: '-6px',
          transform: 'translateY(-50%)',
          display: Math.random() > 0.5 ? 'block' : 'none' // Random puzzle connectors
        }}
      />
      <div 
        className="absolute w-3 h-3 bg-current rounded-full opacity-30"
        style={{
          bottom: '10%',
          left: '-6px',
          transform: 'translateY(50%)',
          display: Math.random() > 0.5 ? 'block' : 'none' // Random puzzle connectors
        }}
      />
    </div>
  )
}

// Safe confetti celebration using unified confetti manager
function CelebrationEffect({ showFireworks }: { showFireworks: boolean }) {
  useEffect(() => {
    if (showFireworks) {
      // 使用統一的 confetti 管理器
      import('@/lib/utils/confetti').then(({ celebrate }) => {
        celebrate({ 
          type: 'fireworks', 
          duration: 5000 
        })
      }).catch(error => {
        console.warn('Failed to load confetti manager:', error)
      })
    }
  }, [showFireworks])

  return null // Visual effect only, no DOM element needed
}

// Main enhanced MapView component
export default function MapView({ completedBooks, showEncouragement, showFireworks }: MapViewProps) {
  const [showModal, setShowModal] = useState(false)
  const [territoryGrid, setTerritoryGrid] = useState(() => generateTerritoryGrid())
  const [previousCompletedCount, setPreviousCompletedCount] = useState(0)
  const [showBookCelebration, setShowBookCelebration] = useState<string | null>(null)

  useEffect(() => {
    if (showEncouragement) {
      setShowModal(true)
    }
  }, [showEncouragement])

  // Track newly completed books for animation and celebration
  useEffect(() => {
    if (completedBooks.length > previousCompletedCount) {
      const newlyCompletedBooks = completedBooks.slice(previousCompletedCount)
      
      // Show celebration for the latest completed book
      if (newlyCompletedBooks.length > 0) {
        setShowBookCelebration(newlyCompletedBooks[newlyCompletedBooks.length - 1])
        setTimeout(() => setShowBookCelebration(null), 2000)
      }
      
      setTerritoryGrid(prev => prev.map(piece => ({
        ...piece,
        isNewlyCompleted: newlyCompletedBooks.includes(piece.book.name)
      })))

      // Clear animation state after duration
      setTimeout(() => {
        setTerritoryGrid(prev => prev.map(piece => ({
          ...piece,
          isNewlyCompleted: false
        })))
      }, 1500)
    }
    setPreviousCompletedCount(completedBooks.length)
  }, [completedBooks, previousCompletedCount])

  const completedSet = new Set(completedBooks)

  return (
    <>
      <div className="w-full bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-100 rounded-lg p-4 shadow-inner relative overflow-hidden">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">🧩 應許之地拼圖</h2>
          <p className="text-gray-600">完成每卷聖經，解鎖一塊聖地拼圖</p>
          <div className="text-sm text-gray-500 mt-2">
            已解鎖 {completedBooks.length} / 66 塊拼圖
          </div>
        </div>

        {/* Puzzle map container with Israel map background */}
        <div 
          className="relative w-full mx-auto rounded-lg overflow-hidden shadow-lg" 
          style={{ 
            aspectRatio: '6/11',  // 橫6直11的比例
            maxWidth: '100%'
          }}
        >
          
          {/* CORE FEATURE: Israel map background layer */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat rounded-lg"
            style={{
              backgroundImage: 'url(/Map.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Map overlay for better contrast */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 via-transparent to-amber-100/20"></div>
            
            {/* Map border */}
            <div className="absolute inset-0 border-4 border-amber-700 rounded-lg opacity-80 shadow-inner"></div>
          </div>

          {/* Territory pieces overlay */}
          {territoryGrid.map((piece) => {
            const isCompleted = completedSet.has(piece.book.name)
            return (
              <TerritoryPiece
                key={piece.id}
                piece={piece}
                isCompleted={isCompleted}
              />
            )
          })}
        </div>

        {/* Progress statistics */}
        <div className="mt-6 p-4 bg-white/80 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">拼圖完成度</span>
            <span className="text-2xl font-bold text-green-600">
              {Math.round((completedBooks.length / ALL_BOOKS.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedBooks.length / ALL_BOOKS.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm text-gray-600">
            {completedBooks.length === ALL_BOOKS.length 
              ? '🎉 恭喜！您已經完全得著應許之地！' 
              : `還需要 ${ALL_BOOKS.length - completedBooks.length} 塊拼圖，就能完全看見聖地全貌`
            }
          </div>
          <div className="text-center mt-1 text-xs text-gray-500">
            💡 完成書卷後，拼圖會變透明，顯示底下的真實聖地地圖
          </div>
          <div className="text-center mt-1 text-xs text-blue-600 font-medium">
            🗺️ 每完成一卷書，就能得著一塊應許之地！
          </div>
        </div>
        
        {/* Copyright notice */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <div className="text-xs text-gray-600 leading-relaxed">
            <div className="font-semibold text-gray-700 mb-1">📍 地圖來源</div>
            <div>
              地圖來自{' '}
              <a 
                href="https://biblegeography.holylight.org.tw/index/condensedbible_map_detail?m_id=106" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                聖光聖經地理資訊網
              </a>
            </div>
            <div className="mt-1 text-gray-500">
              按其版權說明歡迎作教會內非牟利使用
            </div>
          </div>
        </div>
      </div>

      {/* Fireworks celebration - full completion */}
      {showFireworks && (
        <div className="text-center mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <h2 className="text-2xl font-bold text-green-600">🎉 恭喜！您已經完全得著應許之地！🎉</h2>
        </div>
      )}
      
      {/* Encouragement modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-xl font-bold">🧩 拼圖解鎖！</h2>
        <p className="mt-2">您又解鎖了新的拼圖塊！繼續努力，完成整幅應許之地的地圖！</p>
      </Modal>

      {/* Safe confetti celebration */}
      <CelebrationEffect showFireworks={showFireworks} />

      {/* Individual book completion celebration - iOS friendly */}
      {showBookCelebration && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            <div className="text-center">
              <div className="text-2xl mb-1">🎊 得地成功！</div>
              <div className="text-lg font-bold">{showBookCelebration}</div>
              <div className="text-sm">您又得著了一塊應許之地！</div>
            </div>
          </div>
        </div>
      )}

      {/* CSS animations - iOS safe */}
      <style jsx>{`
        @keyframes territory-conquest {
          0% { 
            background-color: rgba(200, 200, 200, 0.95);
            transform: scale(1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
          50% { 
            background-color: rgba(251, 191, 36, 0.8);
            transform: scale(1.1);
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
          }
          100% { 
            background-color: rgba(255, 255, 255, 0.05);
            transform: scale(1);
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
          }
        }
      `}</style>
    </>
  )
}