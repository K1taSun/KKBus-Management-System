"use client";

import { Award, Ticket, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientDashboard() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold text-primary mb-8">Witaj, Janie!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary to-primary-light text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award size={20} className="text-yellow-400" />
              Program Lojalnościowy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">158 <span className="text-xl font-normal opacity-80">pkt</span></div>
            <p className="text-sm mt-2 opacity-80">Brakuje Ci 42 pkt do darmowego biletu!</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Ticket size={20} className="text-action" />
              Aktywne Rezerwacje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">1</div>
            <p className="text-sm text-text-muted mt-2">Kraków → Katowice (Jutro, 08:00)</p>
            <button className="text-xs text-red-500 font-medium mt-2 hover:underline">Anuluj rezerwację (T-24h)</button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <UserIcon size={20} className="text-action" />
              Twoje Konto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-text-muted">
              <p className="font-medium text-primary">Jan Kowalski</p>
              <p>klient@kkbus.pl</p>
              <p>+48 600 100 200</p>
            </div>
            <button className="text-xs text-action font-medium mt-3 hover:underline">Edytuj dane</button>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-primary mb-6">Historia Przejazdów</h2>
      <Card className="shadow-sm border-gray-100 p-8 text-center text-text-muted">
        Tu pojawi się lista Twoich historycznych podróży po zintegrowaniu z backendem.
      </Card>
    </div>
  );
}
