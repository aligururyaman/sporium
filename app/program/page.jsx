'use client'
import React, { useState, useEffect } from 'react'
import { db, auth } from '@/utils/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from "@/assets/images/sporium.jpg"
import { Button } from "@/components/ui/button"

function page() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState(null)
  const [programDays, setProgramDays] = useState({})
  const [loading, setLoading] = useState(true)
  const [openDay, setOpenDay] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchUserDataAndPrograms(currentUser.uid)
      } else {
        setLoading(false)
        setUserInfo(null)
        setProgramDays({})
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchUserDataAndPrograms = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        setUserInfo({
          id: userSnap.id,
          name: userData.name,
        })

        // Programs map'ini al
        if (userData.programs) {
          setProgramDays(userData.programs)
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Veri çekerken hata:', error)
      setLoading(false)
    }
  }

  const toggleDay = (gun) => {
    if (openDay === gun) {
      setOpenDay(null)
    } else {
      setOpenDay(gun)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Button
        variant="ghost"
        className="gap-2 mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4" />
        Geri Dön
      </Button>

      <Image src={logo} alt="logo" width={1000} height={1000} className='w-full h-auto' />
      {userInfo ? (
        <div>

          {Object.keys(programDays).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(programDays).map(([gun, gunData]) => (
                <div key={gun} className="border rounded-lg shadow-sm">
                  <button
                    onClick={() => toggleDay(gun)}
                    className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <h3 className="text-lg font-semibold">{gun}</h3>
                    {openDay === gun ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>

                  {openDay === gun && gunData.exercises && (
                    <div className="p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        {gunData.exercises.map((exercise, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                          >
                            <div className="w-full sm:w-24 h-24 relative">
                              <img
                                src={exercise.img}
                                alt={exercise.name}
                                className="w-full h-full object-contain rounded-lg"
                              />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                              <h4 className="font-semibold text-lg mb-2">{exercise.name}</h4>
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-600">
                                <p className="bg-gray-100 px-3 py-1 rounded-full">
                                  {exercise.setSayisi} Set
                                </p>
                                <p className="bg-gray-100 px-3 py-1 rounded-full">
                                  {exercise.tekrarSayisi} Tekrar
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
              <div className="text-4xl">🏋️‍♂️</div>
              <h3 className="text-xl font-semibold text-gray-700">Henüz program oluşturulmamış</h3>
              <p className="text-gray-500">Size özel antrenman programı yakında eklenecektir.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
          <div className="text-4xl">🔒</div>
          <h3 className="text-xl font-semibold text-gray-700">Giriş Yapılmadı</h3>
          <p className="text-gray-500">Programınızı görmek için lütfen giriş yapın</p>
        </div>
      )}
    </div>
  )
}

export default page
