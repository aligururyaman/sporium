'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/utils/firebase'
import { collection, doc, getDoc, getDocs, query, where, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import Spinner from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from '@/components/ui/checkbox'
import { Select } from '@radix-ui/react-select'
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import bacak from "@/data/bacak.json"
import gogus from "@/data/gogus.json"
import kol from "@/data/kol.json"
import { toast, Toaster } from 'sonner'
import { onAuthStateChanged } from 'firebase/auth'



export default function AdminPanel() {
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState(null)
  const [searchId, setSearchId] = useState("")
  const [searchResult, setSearchResult] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [programDialogOpen, setProgramDialogOpen] = useState(false)
  const [creditAmount, setCreditAmount] = useState("")
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [programDetails, setProgramDetails] = useState(null);
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [setSayisi, setSetSayisi] = useState("");
  const [tekrarSayisi, setTekrarSayisi] = useState("");
  const [selectedDayExercises, setSelectedDayExercises] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: ''
  });
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()

        if (userData?.role !== 'admin') {
          router.push('/')
          return
        }

        setUserInfo(userData)
        setLoading(false)
      } catch (error) {
        console.error('Hata:', error)
        router.push('/')
      }
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [router])

  const handleSearch = async () => {
    try {
      if (!searchId.trim()) {
        toast.error("Lütfen bir ID giriniz");
        return;
      }

      const usersRef = collection(db, "users");
      const searchIdAsString = searchId.trim();
      const searchIdAsNumber = parseInt(searchId.trim());

      const qString = query(usersRef, where("searchId", "==", searchIdAsString));
      const qNumber = query(usersRef, where("searchId", "==", searchIdAsNumber));

      const [snapshotString, snapshotNumber] = await Promise.all([
        getDocs(qString),
        getDocs(qNumber)
      ]);

      let userDoc = null;
      if (!snapshotString.empty) {
        userDoc = snapshotString.docs[0];
      } else if (!snapshotNumber.empty) {
        userDoc = snapshotNumber.docs[0];
      }

      if (!userDoc) {
        setSearchResult(null);
        toast.error("Kullanıcı bulunamadı");
        return;
      }

      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };

      setSearchResult(userData);
      console.log("Bulunan kullanıcı:", userData);

    } catch (error) {
      console.error("Hata:", error);
      toast.error("Arama sırasında bir hata oluştu");
    }
  };

  const handleCreditUpdate = async () => {
    try {
      if (!searchResult || !creditAmount.trim()) {
        toast.error("Lütfen geçerli bir kredi miktarı giriniz");
        return;
      }

      const amount = parseInt(creditAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Lütfen geçerli bir sayı giriniz");
        return;
      }

      const loadingToastId = toast.loading("Kredi yükleniyor...");

      const userRef = doc(db, "users", searchResult.id);
      const currentCredit = parseInt(searchResult.credit || 0);
      const newCredit = currentCredit + amount;

      await updateDoc(userRef, {
        credit: newCredit
      });

      // Arayüzü güncelle
      setSearchResult({
        ...searchResult,
        credit: newCredit
      });

      toast.dismiss(loadingToastId);
      toast.success("Kredi başarıyla yüklendi");
      setDialogOpen(false);
      setCreditAmount("");
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Kredi yükleme sırasında bir hata oluştu");
    }
  };

  const handleCheckboxChange = (day) => {
    setSelectedDays((prevSelectedDays) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((item) => item !== day) // Eğer seçiliyse kaldır
        : [...prevSelectedDays, day] // Değilse ekle
    );
  };

  const handleProgramUpdate = async () => {
    console.log("Seçilen Günler:", selectedDays);
    setProgramDialogOpen(false);
  }


  const handleProgramSelect = (programName) => {
    const selectedProgramData = programs.find(p => p.name === programName);
    setProgramDetails(selectedProgramData);
    setSelectedProgram(programName);
  };

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setExerciseDialogOpen(true);
  };

  const handleExerciseSave = () => {
    if (!setSayisi || !tekrarSayisi) {
      toast.error("Lütfen set ve tekrar sayısını giriniz");
      return;
    }

    const newExercise = {
      ...selectedExercise,
      setSayisi,
      tekrarSayisi
    };

    setSelectedDayExercises(prev => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), newExercise]
    }));

    setExerciseDialogOpen(false);
    setSetSayisi("");
    setTekrarSayisi("");
    toast.success("Egzersiz başarıyla eklendi");
  };

  const handleSaveProgram = async () => {
    try {
      if (!searchResult || !selectedDay || !selectedDayExercises[selectedDay]) {
        toast.error("Lütfen tüm alanları doldurun");
        return;
      }

      const loadingToastId = toast.loading("Program kaydediliyor...");

      // Kullanıcının dökümanına programı ekle
      const userRef = doc(db, "users", searchResult.id);
      const userDoc = await getDoc(userRef);
      const existingPrograms = userDoc.data().programs || {};

      const updatedPrograms = {
        ...existingPrograms,
        [selectedDay]: {
          exercises: selectedDayExercises[selectedDay],
          updatedAt: serverTimestamp()
        }
      };

      await updateDoc(userRef, {
        programs: updatedPrograms
      });

      toast.dismiss(loadingToastId);
      toast.success("Program başarıyla kaydedildi!");

      // Form temizleme
      setSelectedDayExercises(prev => ({
        ...prev,
        [selectedDay]: []
      }));
      setSelectedDay("");
      setSelectedProgram("");
      setProgramDetails(null);

    } catch (error) {
      console.error("Hata:", error);
      toast.error("Program kaydedilirken bir hata oluştu");
    }
  };

  const handleDeleteProgram = async (day) => {
    try {
      const userRef = doc(db, "users", searchResult.id);
      const userDoc = await getDoc(userRef);
      const existingPrograms = userDoc.data().programs || {};

      delete existingPrograms[day];

      await updateDoc(userRef, {
        programs: existingPrograms
      });

      setSearchResult(prev => ({
        ...prev,
        programs: existingPrograms
      }));

      toast.success("Program başarıyla silindi");
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Program silinirken bir hata oluştu");
    }
  };

  const programs = [
    { name: "Bacak", exercises: bacak.exercises },
    { name: "Göğüs", exercises: gogus },
    { name: "Kol", exercises: kol }
  ];

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
    <div className="p-8 flex flex-col items-center justify-center">
      <Toaster richColors position="top-right" />

      <Button
        variant="outline"
        onClick={() => router.push('/')}
        className="self-start mb-4"
      >
        ← Geri Git
      </Button>

      <h1 className="text-2xl font-bold mb-4">Admin Paneli</h1>

      <div className='flex flex-col items-center justify-center gap-5'>
        <div className='flex flex-col items-center justify-center gap-2'>
          <p>Üye ID giriniz</p>
          <Input placeholder="ID giriniz" onChange={(e) => setSearchId(e.target.value)} value={searchId} />
          <Button onClick={handleSearch}>Ara</Button>
        </div>
        <div>
          {searchResult && (
            <div className='flex flex-col items-center justify-center gap-2'>
              <Card className="w-[350px]">
                <CardHeader>
                  <CardTitle className='text-center'>{searchResult.name} {searchResult.surname}</CardTitle>
                  <CardDescription className='text-center'>Kalan Kredi : {searchResult.credit} Gün</CardDescription>
                </CardHeader>
                {searchResult.programs && Object.keys(searchResult.programs).length > 0 && (
                  <CardContent>
                    <h3 className="font-semibold mb-2">Mevcut Programlar:</h3>
                    <div className="space-y-2">
                      {Object.keys(searchResult.programs).map((day) => (
                        <div key={day} className="flex justify-between items-center">
                          <span>{day}</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProgram(day)}
                          >
                            Sil
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
                <CardFooter className="flex justify-between">
                  <Button onClick={() => setProgramDialogOpen(true)}>Gün Seç</Button>
                  <Button onClick={() => setDialogOpen(true)}>Kredi Yükle</Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
        <div className='flex flex-col items-center justify-center gap-4'>
          {selectedDays.length > 0 && (
            <div className='flex  flex-row items-center gap-4'>
              <Select onValueChange={(value) => setSelectedDay(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Gün seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDays.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>
          )}
        </div>
        <div>
          {selectedDay && (
            <div className='flex flex-col items-center justify-center gap-4'>
              <Select onValueChange={handleProgramSelect}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Program seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.name} value={program.name}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {programDetails && (
                <>
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 w-full max-w-[900px]">
                    {programDetails.exercises.map((exercise, index) => (
                      <Card
                        key={index}
                        className="w-full max-w-[350px] mx-auto cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleExerciseClick(exercise)}
                      >
                        <CardHeader>
                          <CardTitle className="text-center">{exercise.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                          <img
                            src={exercise.img}
                            alt={exercise.name}
                            className="w-full max-w-[200px] h-auto object-contain"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedDayExercises[selectedDay] && selectedDayExercises[selectedDay].length > 0 && (
                    <div className="mt-8 w-full max-w-[900px]">
                      <h3 className="text-xl font-bold mb-4">{selectedDay} Programı</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {selectedDayExercises[selectedDay].map((exercise, index) => (
                          <Card key={index} className="w-full">
                            <CardContent className="flex items-center justify-between gap-4 p-4">
                              <div className="flex items-center gap-4">
                                <img
                                  src={exercise.img}
                                  alt={exercise.name}
                                  className="w-20 h-20 object-contain"
                                />
                                <div>
                                  <h4 className="font-bold">{exercise.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    {exercise.setSayisi} set x {exercise.tekrarSayisi} tekrar
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  setSelectedDayExercises(prev => ({
                                    ...prev,
                                    [selectedDay]: prev[selectedDay].filter((_, i) => i !== index)
                                  }));
                                }}
                              >
                                Sil
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button onClick={handleSaveProgram}>Programı Kaydet</Button>
                      </div>
                    </div>
                  )}

                  <Dialog open={exerciseDialogOpen} onOpenChange={setExerciseDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{selectedExercise?.name}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="setSayisi">Set Sayısı</Label>
                          <Input
                            id="setSayisi"
                            type="number"
                            value={setSayisi}
                            onChange={(e) => setSetSayisi(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tekrarSayisi">Tekrar Sayısı</Label>
                          <Input
                            id="tekrarSayisi"
                            type="number"
                            value={tekrarSayisi}
                            onChange={(e) => setTekrarSayisi(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setExerciseDialogOpen(false)}>
                          İptal
                        </Button>
                        <Button onClick={handleExerciseSave}>
                          Kaydet
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kredi Yükle</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="credit">Yüklemek istediğiniz gün sayısı:</Label>
            <Input
              id="credit"
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleCreditUpdate}>Yükle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Program Yükle</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-col gap-2 ">
              {["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"].map(
                (day) => (
                  <div key={`checkbox-${day}`} className="flex flex-row items-center gap-2">
                    <input
                      type="checkbox"
                      id={`checkbox-${day}`}
                      checked={selectedDays.includes(day)}
                      onChange={() => handleCheckboxChange(day)}
                      className="cursor-pointer"
                    />
                    <Label
                      htmlFor={`checkbox-${day}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {day}
                    </Label>
                  </div>
                )
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgramDialogOpen(false)}>İptal</Button>
            <Button onClick={handleProgramUpdate}>Yükle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
} 