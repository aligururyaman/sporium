"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/utils/firebase"
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link"



export function RegisterForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("")
  const router = useRouter();


  const handleSignUp = async (event) => {
    event.preventDefault();
    const loadingToastId = toast.loading("Kayıt işlemi yapılıyor...");

    try {
      if (!db) {
        throw new Error("Veritabanı bağlantısı kurulamadı");
      }

      const counterRef = doc(db, "counters", "userCounter");
      const counterDoc = await getDoc(counterRef);

      let nextId = 1000;
      if (counterDoc.exists()) {
        nextId = counterDoc.data().currentId + 1;
        await updateDoc(counterRef, { currentId: nextId });
      } else {
        await setDoc(counterRef, { currentId: nextId });
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        surname,
        email: user.email,
        role: "user",
        uniqueId: user.uid,
        searchId: nextId,
        createdAt: new Date(),
      });

      toast.dismiss(loadingToastId);
      toast.success("Kayıt işlemi başarılı! Giriş yapabilirsiniz.");

      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error("Kayıt hatası:", error);

      // Firebase hata kodlarına göre özelleştirilmiş mesajlar
      const errorMessages = {
        'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda',
        'auth/invalid-email': 'Geçersiz e-posta adresi',
        'auth/operation-not-allowed': 'Kayıt işlemi şu anda yapılamıyor',
        'auth/weak-password': 'Şifre en az 6 karakter olmalıdır',
        'auth/network-request-failed': 'Ağ bağlantısı hatası'
      };

      const errorMessage = errorMessages[error.code] || 'Kayıt sırasında bir hata oluştu: ' + error.message;
      toast.error(errorMessage);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Kayıt Ol</h1>
        <p className="text-balance text-sm text-muted-foreground">
          E-mail adresinizi ve şifrenizi giriniz.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label >İsim</Label>
          <Input id="name" type="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label >Soyisim</Label>
          <Input id="surname" type="surname" required value={surname} onChange={(e) => setSurname(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label>Şifre</Label>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button
          type="submit"
          className="w-full"
          onClick={handleSignUp}
        >
          Kayıt Ol
        </Button>
        <div className="text-center text-sm">
          Hesabın var mı?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Giriş Yap
          </Link>
        </div>


      </div>
    </form>
  )
}
