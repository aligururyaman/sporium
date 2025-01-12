"use client"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

function page() {
  const router = useRouter()
  const equipment = require('../../data/equipment.json')

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Geri butonu */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Geri Dön
      </Button>

      {/* Başlık */}
      <h1 className="text-3xl font-bold text-center mb-8">Spor Ekipmanlarımız</h1>

      {/* Ekipman grid'i */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Ekipman resmi */}
            <div className="h-48 overflow-hidden">
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Ekipman bilgileri */}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default page
