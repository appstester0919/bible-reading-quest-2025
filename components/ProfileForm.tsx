'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface Profile {
  username: string | null;
  avatar_url: string | null;
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
    setUsername(profile.username || '')
    setAvatarUrl(profile.avatar_url || null)
  }, [profile, supabase.auth])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
      setAvatarUrl(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    // --- Start of new validation ---
    if (username.trim().length < 3) {
      setError('用戶名必須至少為3個字符。')
      return
    }
    // --- End of new validation ---

    setIsLoading(true)
    setMessage(null)
    setError(null)

    let publicUrl = avatarUrl

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) {
        setError(`頭像上傳失敗: ${uploadError.message}`)
        setIsLoading(false)
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      publicUrl = data.publicUrl
    }

    const { error: updateError } = await supabase.from('profiles').upsert({
      id: user.id,
      username: username.trim(),
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })

    if (updateError) {
      setError(`更新個人資料失敗: ${updateError.message}`)
    } else {
      setMessage('個人資料已成功更新！')
      if (publicUrl) {
        setAvatarUrl(publicUrl)
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">更新您的個人資料</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0">
                {avatarUrl && <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />}
              </div>
              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">上傳新頭像</label>
                <input type="file" id="avatar" onChange={handleFileChange} accept="image/*" className="mt-1 text-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">用戶名 (至少3個字符)</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                minLength={3}
              />
            </div>
            <div>
              <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                {isLoading ? '儲存中...' : '儲存變更'}
              </button>
            </div>
            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        </div>
      </div>
      <div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">讀經計劃</h2>
          <p className="text-sm text-gray-600 mb-4">需要調整您的讀經速度或方式嗎？您可以隨時更新您的計劃。</p>
          <Link href="/plan" className="block w-full text-center py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            更新我的計劃
          </Link>
        </div>
      </div>
    </div>
  )
}
