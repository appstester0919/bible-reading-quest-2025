export default function AuthCodeError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 text-center bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600">驗證錯誤</h1>
        <p className="text-gray-700">
          您的驗證連結無效或已過期。
        </p>
        <p className="text-gray-700">
          請嘗試重新登入或註冊。
        </p>
      </div>
    </div>
  );
}
