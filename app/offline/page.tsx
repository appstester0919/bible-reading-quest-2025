'use client'

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">📱</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          離線模式
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          您目前處於離線狀態。部分功能可能無法使用，但您仍然可以：
        </p>
        
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-start space-x-3 p-3 bg-green-50 rounded-lg">
            <span className="text-green-600">✓</span>
            <span className="text-sm text-gray-700">查看已快取的讀經內容</span>
          </div>
          
          <div className="flex items-center justify-start space-x-3 p-3 bg-green-50 rounded-lg">
            <span className="text-green-600">✓</span>
            <span className="text-sm text-gray-700">記錄讀經進度（稍後同步）</span>
          </div>
          
          <div className="flex items-center justify-start space-x-3 p-3 bg-green-50 rounded-lg">
            <span className="text-green-600">✓</span>
            <span className="text-sm text-gray-700">查看個人統計資料</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={handleReload}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            重新連線
          </button>
          
          <button 
            onClick={handleGoBack}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            返回上一頁
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600">
            💡 提示：當網路恢復時，您的資料將自動同步到雲端
          </p>
        </div>
      </div>
    </div>
  );
}