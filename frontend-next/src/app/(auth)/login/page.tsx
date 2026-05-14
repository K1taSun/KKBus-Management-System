"use client";

import { useRouter } from "next/navigation";
import { User, Shield, Bus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (role: string) => {
    switch (role) {
      case "client":
        router.push("/dashboard");
        break;
      case "driver":
        router.push("/driver");
        break;
      case "admin":
        router.push("/admin");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background-main flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-gray-100 rounded-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center">
            <Bus size={32} />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">KKBus System</CardTitle>
            <CardDescription>Zaloguj się do swojego konta</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-text-muted text-center mb-4">Wybierz rolę (Tryb Deweloperski):</p>
            <Button 
              className="w-full bg-action hover:bg-action-hover text-white py-6 flex gap-3 justify-start px-6 rounded-xl"
              onClick={() => handleLogin("client")}
            >
              <User size={20} /> Zaloguj jako Pasażer
            </Button>
            <Button 
              className="w-full bg-slate-700 hover:bg-slate-800 text-white py-6 flex gap-3 justify-start px-6 rounded-xl"
              onClick={() => handleLogin("driver")}
            >
              <Bus size={20} /> Zaloguj jako Kierowca
            </Button>
            <Button 
              className="w-full bg-primary hover:bg-primary-light text-white py-6 flex gap-3 justify-start px-6 rounded-xl"
              onClick={() => handleLogin("admin")}
            >
              <Shield size={20} /> Zaloguj jako Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
