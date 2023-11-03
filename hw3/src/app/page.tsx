'use client';
import UsernameBar from '@/components/UsernameBar.client'
import SearchAddBar from '@/components/SearchAddBar.client';
import Events from '@/components/Events';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams()
  const username = searchParams.get('username') || '';
  const searchTerm = searchParams.get('searchTerm') || '';

  const router = useRouter();
  if (username == '') {
    router.push("/?username=guest");
  }
  // const [username, setUsername] = useState<string>("Guest");
  // const [searchTerm, setSearchTerm] = useState<string>("");
  // const [refreshKey, setRefreshKey] = useState<number>(0);

  // const router = useRouter();

  // useEffect(() => {
  //   if (router.query.username) {
  //     setUsername(router.query.username as string);
  //   }
  //   if (router.query.searchTerm) {
  //     setSearchTerm(router.query.searchTerm as string);
  //   }
  // }, [router.query]);

  return (
    <div className="p-8">
      <UsernameBar username={username}/>
      <SearchAddBar searchTerm={searchTerm}/>
      <main className="flex min-h-screen flex-col items-center justify-between p-8">
        <Events username={username} searchTerm={searchTerm}/>
      </main>
    </div>
  )
}
