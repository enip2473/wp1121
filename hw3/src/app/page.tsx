'use client';
import UsernameBar from '@/components/UsernameBar'
import SearchAddBar from '@/components/SearchAddBar';
import Events from '@/components/Events';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const searchParams = useSearchParams()
  const username = searchParams.get('username') || '';
  const searchTerm = searchParams.get('searchTerm') || '';
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  if (username == '') {
    router.push("/?username=guest");
  }
  return (
    <div className="p-8">
      <UsernameBar username={username}/>
      <SearchAddBar searchTerm={searchTerm} setRefreshKey={setRefreshKey}/>
      <main className="flex min-h-screen flex-col items-center justify-between p-8">
        <Events username={username} searchTerm={searchTerm} refreshKey={refreshKey}/>
      </main>
    </div>
  )
}
