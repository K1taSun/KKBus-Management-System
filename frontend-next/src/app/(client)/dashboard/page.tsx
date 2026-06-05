"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Award, Ticket, User as UserIcon, Settings, History, Gift,
  ChevronRight, LogOut, Calendar, MapPin, CreditCard, Shield,
  Phone, Mail, Hash, Clock, Star, ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/LanguageContext";
import { apiGet, apiPatch, apiPost, apiDelete } from "@/lib/api";

// Types
interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  createdAt: string;
  dateOfBirth: string;
  clientNumber: string;
  loyaltyOptIn: boolean;
  pointsBalance: number;
}

interface Reservation {
  id: string;
  seat_number: number;
  status: string;
  created_at: string;
  departure_time: string;
  arrival_time: string;
  price_base: string;
  route_name: string;
  total_distance_km: number;
}

interface LoyaltyReward {
  id: number;
  name: string;
  required_points: number;
}

interface LoyaltyTransaction {
  id: number;
  points_delta: number;
  description: string;
  transaction_date: string;
}

type Tab = "overview" | "reservations" | "loyalty" | "settings";

const FREE_TICKET_THRESHOLD = 200;

export default function ClientDashboard() {
  const router = useRouter();
  const { t, language } = useTranslation();

  // State
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  // Settings form
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Cancel modal
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Toast messages
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiGet<Profile>("/auth/profile");
      setProfile(data);
      setFormFirstName(data.firstName);
      setFormLastName(data.lastName);
      setFormPhone(data.phone || "");
    } catch {
      setNeedsLogin(true);
    }
  }, []);

  const fetchReservations = useCallback(async () => {
    try {
      const data = await apiGet<Reservation[]>("/auth/history");
      setReservations(data);
    } catch { /* silent */ }
  }, []);

  const fetchLoyalty = useCallback(async () => {
    try {
      const [rewardsData, txData] = await Promise.all([
        apiGet<LoyaltyReward[]>("/loyalty/rewards"),
        apiGet<LoyaltyTransaction[]>("/loyalty/transactions"),
      ]);
      setRewards(rewardsData);
      setTransactions(txData);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      await fetchProfile();
      await Promise.all([fetchReservations(), fetchLoyalty()]);
      setLoading(false);
    };
    init();
  }, [fetchProfile, fetchReservations, fetchLoyalty]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      await apiPatch("/auth/profile", {
        first_name: formFirstName,
        last_name: formLastName,
        phone: formPhone,
      });
      setSaveMsg(t("dash.settingsSaved") as string);
      await fetchProfile();
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : (t("dash.error") as string));
    }
    setSaving(false);
  };

  const handleCancelReservation = async (id: string) => {
    try {
      await apiDelete(`/reservations/${id}`);
      showToast(t("dash.resCancelled") as string);
      await fetchReservations();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : (t("dash.error") as string), "error");
    }
    setCancellingId(null);
  };

  const handleRedeemReward = async (rewardId: number) => {
    try {
      const res = await apiPost<{ message: string; voucherCode: string; remainingPoints: number }>(
        "/loyalty/redeem",
        { rewardId }
      );
      showToast(`${res.message} Voucher: ${res.voucherCode}`);
      await fetchProfile();
      await fetchLoyalty();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : (t("dash.error") as string), "error");
    }
  };

  const handleLogout = async () => {
    try {
      await apiPost("/auth/logout");
    } catch { /* silent */ }
    router.push("/");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(language === "pl" ? "pl-PL" : "en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString(language === "pl" ? "pl-PL" : "en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeReservations = reservations.filter(
    (r) => r.status !== "Anulowana" && new Date(r.departure_time) > new Date()
  );

  const statusBadge = (status: string) => {
    if (status === "Potwierdzona")
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">{t("dash.resConfirmed")}</span>;
    if (status === "Opłacona")
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{t("dash.resPaid")}</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{t("dash.resCancelledStatus")}</span>;
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 className="h-10 w-10 text-action animate-spin" />
          <p className="text-text-muted">{t("dash.loading")}</p>
        </div>
      </div>
    );
  }

  // Login required
  if (needsLogin || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Card className="max-w-md w-full shadow-xl border-gray-100">
          <CardContent className="p-10 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-primary">{t("dash.loginRequired")}</h2>
            <Button
              className="bg-action hover:bg-action-hover text-white px-8"
              onClick={() => router.push("/login")}
            >
              {t("dash.loginBtn")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pointsMissing = Math.max(0, FREE_TICKET_THRESHOLD - profile.pointsBalance);
  const loyaltyProgress = Math.min(100, (profile.pointsBalance / FREE_TICKET_THRESHOLD) * 100);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("dash.tabOverview") as string, icon: <UserIcon size={18} /> },
    { key: "reservations", label: t("dash.tabReservations") as string, icon: <Ticket size={18} /> },
    { key: "loyalty", label: t("dash.tabLoyalty") as string, icon: <Award size={18} /> },
    { key: "settings", label: t("dash.tabSettings") as string, icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-background-alt pt-28 pb-16">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-[100] max-w-sm px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all animate-fade-in ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">
            {t("dash.welcome")}, {profile.firstName}! 👋
          </h1>
          <p className="text-text-muted mt-1">
            {t("dash.clientNumber")}: <span className="font-mono font-semibold text-primary">{profile.clientNumber}</span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-md"
                  : "text-text-muted hover:bg-gray-50 hover:text-primary"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* === OVERVIEW TAB === */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Loyalty Card */}
            <Card className="bg-gradient-to-br from-primary to-primary-light text-white border-0 shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award size={20} className="text-yellow-400" />
                  {t("dash.loyaltyCard")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {profile.pointsBalance}{" "}
                  <span className="text-xl font-normal opacity-80">{t("dash.loyaltyPoints")}</span>
                </div>
                {/* Progress bar */}
                <div className="mt-4 bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                    style={{ width: `${loyaltyProgress}%` }}
                  />
                </div>
                <p className="text-sm mt-2 opacity-80">
                  {pointsMissing > 0
                    ? `${t("dash.loyaltyMissing")} ${pointsMissing} ${t("dash.loyaltyMissingEnd")}`
                    : "🎉"}
                </p>
              </CardContent>
            </Card>

            {/* Active Reservations */}
            <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Ticket size={20} className="text-action" />
                  {t("dash.activeRes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{activeReservations.length}</div>
                {activeReservations.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {activeReservations.slice(0, 2).map((r) => (
                      <div key={r.id} className="text-sm text-text-muted flex items-center gap-2">
                        <MapPin size={14} className="text-action shrink-0" />
                        <span className="truncate">{r.route_name}</span>
                        <span className="text-xs opacity-70 ml-auto whitespace-nowrap">
                          {formatDateTime(r.departure_time)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted mt-2">{t("dash.noActiveRes")}</p>
                )}
                <button
                  onClick={() => setActiveTab("reservations")}
                  className="text-xs text-action font-medium mt-3 hover:underline flex items-center gap-1"
                >
                  {t("dash.resHistory")} <ChevronRight size={14} />
                </button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <UserIcon size={20} className="text-action" />
                  {t("dash.yourAccount")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-text-muted">
                  <p className="font-semibold text-primary text-base">{profile.firstName} {profile.lastName}</p>
                  <p className="flex items-center gap-2"><Mail size={14} />{profile.email}</p>
                  <p className="flex items-center gap-2"><Phone size={14} />{profile.phone || "—"}</p>
                  <p className="flex items-center gap-2">
                    <Calendar size={14} />
                    {t("dash.memberSince")}: {formatDate(profile.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="text-xs text-action font-medium mt-3 hover:underline flex items-center gap-1"
                >
                  {t("dash.editProfile")} <ChevronRight size={14} />
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* === RESERVATIONS TAB === */}
        {activeTab === "reservations" && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("dash.resHistory")}</h2>
            {reservations.length === 0 ? (
              <Card className="shadow-sm border-gray-100 p-10 text-center">
                <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-text-muted">{t("dash.resEmpty")}</p>
              </Card>
            ) : (
              <Card className="shadow-sm border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-text-muted font-medium">
                        <th className="px-5 py-4">{t("dash.resRoute")}</th>
                        <th className="px-5 py-4">{t("dash.resDeparture")}</th>
                        <th className="px-5 py-4 text-center">{t("dash.resSeat")}</th>
                        <th className="px-5 py-4">{t("dash.resStatus")}</th>
                        <th className="px-5 py-4 text-right">{t("dash.resPrice")}</th>
                        <th className="px-5 py-4 text-center">{t("dash.resActions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reservations.map((r) => {
                        const departureDate = new Date(r.departure_time);
                        const hoursUntil = (departureDate.getTime() - Date.now()) / (1000 * 60 * 60);
                        const canCancel = r.status !== "Anulowana" && hoursUntil >= 24;

                        return (
                          <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-4 font-medium text-primary">{r.route_name}</td>
                            <td className="px-5 py-4 text-text-muted">{formatDateTime(r.departure_time)}</td>
                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                                {r.seat_number}
                              </span>
                            </td>
                            <td className="px-5 py-4">{statusBadge(r.status)}</td>
                            <td className="px-5 py-4 text-right font-semibold text-primary">
                              {parseFloat(r.price_base).toFixed(2)} PLN
                            </td>
                            <td className="px-5 py-4 text-center">
                              {canCancel ? (
                                cancellingId === r.id ? (
                                  <div className="flex items-center gap-2 justify-center">
                                    <Button
                                      size="sm"
                                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 h-8"
                                      onClick={() => handleCancelReservation(r.id)}
                                    >
                                      {t("dash.resCancel")}
                                    </Button>
                                    <button
                                      onClick={() => setCancellingId(null)}
                                      className="text-xs text-text-muted hover:text-primary"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setCancellingId(r.id)}
                                    className="text-xs text-red-500 font-medium hover:underline"
                                  >
                                    {t("dash.resCancel")}
                                  </button>
                                )
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* === LOYALTY TAB === */}
        {activeTab === "loyalty" && (
          <div className="animate-fade-in space-y-8">
            {!profile.loyaltyOptIn ? (
              <Card className="shadow-sm border-gray-100 p-10 text-center">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-text-muted">{t("dash.loyaltyNotEnrolled")}</p>
              </Card>
            ) : (
              <>
                {/* Balance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-primary to-primary-light text-white border-0 shadow-lg">
                    <CardContent className="p-8">
                      <p className="text-white/70 text-sm font-medium mb-1">{t("dash.loyaltyBalance")}</p>
                      <div className="text-5xl font-bold">
                        {profile.pointsBalance}
                        <span className="text-2xl font-normal ml-2 opacity-70">{t("dash.loyaltyPoints")}</span>
                      </div>
                      <div className="mt-5 bg-white/20 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                          style={{ width: `${loyaltyProgress}%` }}
                        />
                      </div>
                      <p className="text-sm mt-3 opacity-80">
                        {pointsMissing > 0
                          ? `${t("dash.loyaltyMissing")} ${pointsMissing} ${t("dash.loyaltyMissingEnd")}`
                          : "🎉 Masz wystarczająco punktów!"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Rewards */}
                  <Card className="shadow-sm border-gray-100">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-primary">
                        <Gift size={20} className="text-action" />
                        {t("dash.loyaltyRewards")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {rewards.map((reward) => (
                        <div
                          key={reward.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-action/30 hover:bg-action/5 transition-all"
                        >
                          <div>
                            <p className="font-medium text-primary text-sm">{reward.name}</p>
                            <p className="text-xs text-text-muted">
                              {t("dash.loyaltyRequired")}: <span className="font-semibold">{reward.required_points} {t("dash.loyaltyPoints")}</span>
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-action hover:bg-action-hover text-white text-xs px-4 h-8"
                            disabled={profile.pointsBalance < reward.required_points}
                            onClick={() => handleRedeemReward(reward.id)}
                          >
                            {t("dash.loyaltyRedeem")}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Transaction History */}
                <Card className="shadow-sm border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-primary">
                      <History size={20} className="text-action" />
                      {t("dash.loyaltyHistory")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactions.length === 0 ? (
                      <p className="text-text-muted text-center py-6">{t("dash.loyaltyNoHistory")}</p>
                    ) : (
                      <div className="space-y-2">
                        {transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              tx.points_delta > 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                            }`}>
                              {tx.points_delta > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-primary truncate">{tx.description}</p>
                              <p className="text-xs text-text-muted">{formatDateTime(tx.transaction_date)}</p>
                            </div>
                            <span className={`font-bold text-sm whitespace-nowrap ${
                              tx.points_delta > 0 ? "text-emerald-600" : "text-red-500"
                            }`}>
                              {tx.points_delta > 0 ? "+" : ""}{tx.points_delta} {t("dash.loyaltyPoints")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* === SETTINGS TAB === */}
        {activeTab === "settings" && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edit Form */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Settings size={20} className="text-action" />
                  {t("dash.settingsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-text-muted mb-1.5 block">{t("dash.settingsFirstName")}</label>
                  <Input
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    icon={<UserIcon size={16} />}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted mb-1.5 block">{t("dash.settingsLastName")}</label>
                  <Input
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    icon={<UserIcon size={16} />}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-muted mb-1.5 block">{t("dash.settingsPhone")}</label>
                  <Input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    icon={<Phone size={16} />}
                    placeholder="+48600100200"
                  />
                </div>

                {saveMsg && (
                  <p className={`text-sm font-medium ${saveMsg.includes("pomyślnie") || saveMsg.includes("successfully") ? "text-emerald-600" : "text-red-500"}`}>
                    {saveMsg}
                  </p>
                )}

                <Button
                  className="w-full bg-action hover:bg-action-hover text-white"
                  onClick={handleSaveProfile}
                  isLoading={saving}
                >
                  {t("dash.settingsSave")}
                </Button>
              </CardContent>
            </Card>

            {/* Account Info (read-only) */}
            <div className="space-y-6">
              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <Shield size={20} className="text-action" />
                    {t("dash.settingsAccountInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-text-muted flex items-center gap-2"><Mail size={14} />{t("dash.settingsEmail")}</span>
                    <span className="text-sm font-medium text-primary">{profile.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-text-muted flex items-center gap-2"><Hash size={14} />{t("dash.clientNumber")}</span>
                    <span className="text-sm font-mono font-bold text-primary">{profile.clientNumber}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-text-muted flex items-center gap-2"><Calendar size={14} />{t("dash.settingsDob")}</span>
                    <span className="text-sm font-medium text-primary">{formatDate(profile.dateOfBirth)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-text-muted flex items-center gap-2"><Clock size={14} />{t("dash.memberSince")}</span>
                    <span className="text-sm font-medium text-primary">{formatDate(profile.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-text-muted flex items-center gap-2"><Shield size={14} />{t("dash.settingsStatus")}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {profile.status === "active" ? "✓ Active" : profile.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-text-muted flex items-center gap-2"><Star size={14} />{t("dash.tabLoyalty")}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.loyaltyOptIn ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"}`}>
                      {profile.loyaltyOptIn ? "✓ Active" : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Logout */}
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 gap-2"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                {t("dash.settingsLogout")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Fade-in animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
