'use client'

import { useState } from 'react'

export default function ConfettiTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  const [deviceInfo, setDeviceInfo] = useState<string>('')

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const getDeviceInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${screen.width}x${screen.height}`,
      devicePixelRatio: window.devicePixelRatio
    }
    setDeviceInfo(JSON.stringify(info, null, 2))
    addResult(`設備信息已獲取: ${info.isIOS ? 'iOS設備' : '非iOS設備'}`)
  }

  const testBasicConfetti = async () => {
    setIsLoading(true)
    try {
      addResult('開始測試基本confetti效果...')
      
      const { celebrate } = await import('@/lib/utils/confetti')
      const success = await celebrate({ type: 'basic', particleCount: 100 })
      
      if (success) {
        addResult('✅ 基本confetti效果成功！')
      } else {
        addResult('⚠️ 使用了fallback慶祝效果')
      }
    } catch (error) {
      addResult(`❌ 基本confetti效果失敗: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testAdvancedConfetti = async () => {
    setIsLoading(true)
    try {
      addResult('開始測試進階confetti效果...')
      
      const confetti = await import('canvas-confetti')
      
      const { celebrate } = await import('@/lib/utils/confetti')
      const success = await celebrate({ type: 'fireworks', duration: 3000 })
      
      if (success) {
        addResult('✅ 進階confetti效果成功！')
      } else {
        addResult('⚠️ 使用了fallback慶祝效果')
      }
    } catch (error) {
      addResult(`❌ 進階confetti效果失敗: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testCanvasAvailability = () => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        addResult('✅ Canvas 2D支持正常')
        
        // Test canvas operations
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(0, 0, 10, 10)
        addResult('✅ Canvas繪圖操作正常')
      } else {
        addResult('❌ Canvas 2D不支持')
      }
    } catch (error) {
      addResult(`❌ Canvas測試失敗: ${error}`)
    }
  }

  const testAnimationFrame = () => {
    try {
      let count = 0
      const animate = () => {
        count++
        if (count < 10) {
          requestAnimationFrame(animate)
        } else {
          addResult('✅ requestAnimationFrame支持正常')
        }
      }
      requestAnimationFrame(animate)
    } catch (error) {
      addResult(`❌ requestAnimationFrame測試失敗: ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🎉 Confetti iOS 兼容性測試
        </h1>

        {/* Device Info */}
        <div className="mb-8">
          <button
            onClick={getDeviceInfo}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors mb-4"
          >
            📱 獲取設備信息
          </button>
          {deviceInfo && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold mb-2">設備信息：</h3>
              <pre className="text-sm text-gray-700 overflow-auto">{deviceInfo}</pre>
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={testCanvasAvailability}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            🎨 測試Canvas支持
          </button>
          
          <button
            onClick={testAnimationFrame}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            🎬 測試動畫支持
          </button>
          
          <button
            onClick={testBasicConfetti}
            disabled={isLoading}
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? '⏳ 測試中...' : '🎊 基本Confetti測試'}
          </button>
          
          <button
            onClick={testAdvancedConfetti}
            disabled={isLoading}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? '⏳ 測試中...' : '🎆 進階Confetti測試'}
          </button>
        </div>

        {/* Results */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">測試結果:</h3>
            <button
              onClick={clearResults}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              清除結果
            </button>
          </div>
          
          <div className="bg-black text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
            {testResults.length > 0 ? (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            ) : (
              <div className="text-gray-500">等待測試結果...</div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h4 className="font-bold text-blue-800 mb-2">使用說明：</h4>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>首先點擊「獲取設備信息」確認當前設備類型</li>
            <li>依次測試Canvas和動畫支持</li>
            <li>然後測試基本和進階Confetti效果</li>
            <li>觀察是否有任何錯誤或崩潰發生</li>
            <li>如果在iOS設備上所有測試都通過，說明Confetti動畫是安全的</li>
          </ul>
        </div>
      </div>
    </div>
  )
}