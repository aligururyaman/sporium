'use client'

import { use, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from '@/utils/firebase'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import Spinner from '@/components/ui/spinner'
import Image from 'next/image'
import { Instagram, Phone, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import logo from '@/assets/images/sporium.jpg'


export default function Home() {
  const [user, setUser] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter();
  const [api, setApi] = useState(null)

  const images = [
    "https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1526403646408-57b94dc15399?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1533560777802-046814bc297c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  ];

  const mesaj = [
    "Başarı, disiplinle başlar. Devam et!",
    "Her antrenman seni hedeflerine bir adım daha yaklaştırır.",
    "Ter, vücudundaki yağların ağlamasıdır. Devam et!",
    "Aşırıya kaçmana gerek yok, tutarlı olman yeterli."
  ];


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsLoggedIn(false)
        setLoading(false);
        console.log("user yok");
        return
      }
      setIsLoggedIn(true)
      setLoading(false);
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      const fetchUserInfo = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          setUserInfo(userDoc.data());
          setLoading(false);
        } catch (error) {
          console.error("Hata:", error);
          setLoading(false);
        }
      };

      fetchUserInfo();
    }
  }, [user])

  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      api.scrollNext()
    }, 4000)

    return () => clearInterval(interval)
  }, [api])

  // İsmin baş harflerini büyük yapan yardımcı fonksiyon
  const capitalizeWords = (str) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth)
      window.location.reload()
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Spinner className="h-8 w-8 text-primary" />
          <span className="text-sm text-muted-foreground">Yükleniyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center  p-8">
      <div className='flex mb-10  justify-end h-6 bg-gray-100 w-full rounded-xl'>
        {isLoggedIn ? (

          <div className='flex items-center justify-center p-2'>
            <h1 className="text-gray-500">
              {userInfo && capitalizeWords(userInfo.name)}{"  | "}
              {userInfo && (userInfo.searchId)}
              {userInfo?.role === 'admin' && (
                <Button
                  className="text-gray-500 ml-2"
                  variant="link"
                  onClick={() => router.push('/admin')}
                >
                  Admin Panel
                </Button>
              )}
              <Button className="text-gray-500" variant="link" onClick={handleLogout}>Çıkış</Button>
            </h1>
          </div>

        ) : (
          <div onClick={() => router.push('/login')} className='cursor-pointer flex items-center justify-center p-2' >
            <h1 className="text-sm text-gray-500">
              <Button className=" text-gray-500" variant="link">Giriş Yap</Button>
            </h1>
          </div>
        )}
      </div>
      <div className='flex justify-center items-center'>
        <Image
          src={logo}
          alt="logo"
          width={400}
          height={400}
        />
      </div>
      {isLoggedIn ? (
        <>


          {/* Cards linkleri */}
          <div className="flex flex-col md:flex-row w-full">
            <div className="relative w-full md:w-1/3 h-72 mt-4 md:mt-0 md:ml-4 cursor-pointer " onClick={() => router.push('/program')}>
              <Image
                src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="program"
                fill
                className="object-cover rounded-2xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
                <h2 className="text-white text-2xl md:text-4xl font-bold">
                  Sana Özel Program
                </h2>
              </div>
            </div>
            <div className="relative w-full md:w-1/3 h-72 mt-4 md:mt-0 md:ml-4 cursor-pointer " onClick={() => router.push('/products')}>
              <Image
                src="https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="ürünler"
                fill
                className="object-cover rounded-2xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
                <h2 className="text-white text-2xl md:text-4xl font-bold">
                  Ürünler
                </h2>
              </div>
            </div>
            <div className="relative w-full md:w-1/3 h-72 mt-4 md:mt-0 md:ml-4 cursor-pointer " onClick={() => router.push('/equipment')}>
              <Image
                src="https://images.unsplash.com/photo-1591311630200-ffa9120a540f?q=80&w=2010&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Ekipmanlar"
                fill
                className="object-cover rounded-2xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
                <h2 className="text-white text-2xl md:text-4xl font-bold">
                  Ekipmanlar
                </h2>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center w-full">
          <Carousel
            className="w-full max-w-screen"
            setApi={setApi}
            opts={{
              loop: true,
            }}
          >
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index} className="px-2">
                  <div className="relative w-full md:h-[60vh] h-[40vh]" >
                    <Image
                      src={image}
                      alt={`Slide ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-65 flex items-center justify-center ">
                      <h2 className="text-white hidden md:flex md:text-4xl font-bold">
                        {mesaj[index]}
                      </h2>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )
      }

      {/* section */}
      <div className="flex flex-col md:flex-row w-full mt-20">
        <div className="relative w-full md:w-full h-40 mt-4 md:mt-0 md:ml-4  ">
          <Image
            src="https://images.unsplash.com/photo-1623874400767-0fcdeedd0f5d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Ekipmanlar"
            fill
            className="object-cover rounded-2xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
            <h2 className="text-white text-xl md:text-4xl font-bold">
              Kendinin En İyi Versiyonu OL !
            </h2>
          </div>
        </div>
      </div>

      {/* footer */}
      <footer className="w-full mt-20 bg-gray-50 dark:bg-gray-900 rounded-xl">
        <div className="mx-auto w-full max-w-screen-xl p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Sol taraf - Logo ve açıklama */}
            <div className="flex flex-col items-center md:items-start">
              <h2 className="text-2xl font-bold text-primary">Sporium</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md text-center md:text-left">
                Sağlıklı yaşam ve fitness yolculuğunuzda yanınızdayız.
              </p>
            </div>

            {/* Sağ taraf - İletişim bilgileri */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <a href="tel:+905555555555" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  +90 530 796 28 10
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-primary" />
                <a
                  href="https://instagram.com/kadirlisporiumfitness"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  @sporium
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href="mailto:info@sporium.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  info@sporium.com
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Kadirli, Osmaniye, Türkiye
                </span>
              </div>
            </div>
          </div>

          {/* Alt kısım - Telif hakkı */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-4">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Sporium. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div >
  )
}
