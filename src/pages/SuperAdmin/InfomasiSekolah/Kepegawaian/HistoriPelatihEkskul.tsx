import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/pages/Footer";
import { ArrowLeft, Loader2Icon, ChevronDownIcon, ChevronRightIcon, CalendarIcon, Trophy } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

interface EkskulItem {
  ekskul_id: number;
  nama_ekskul: string;
  anggaran: string;
  status_ekskul: string;
  status_aktif_ekskul: string;
}

interface PeriodeItem {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  ekstrakurikuler: EkskulItem[];
}

interface PelatihData {
  pelatih_id: number;
  nama_pelatih: string;
  nip?: string;
  nuptk?: string;
  periode: PeriodeItem[];
}

const HistoriPelatihEkskul = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState<PelatihData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTahun, setExpandedTahun] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/spa/pelatih/ekstrakurikuler/${id}`)
      .then((res) => {
        if (res.data.status === "success" && res.data.data) {
          const d: PelatihData = res.data.data;
          setData(d);
          setExpandedTahun(d.periode.map((p) => p.tahun_akademik));
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
          Swal.fire({ icon: "error", title: "Gagal memuat data!", text: err.response?.data?.message });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleTahun = (key: string) => setExpandedTahun((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const totalEkskul = data?.periode.reduce((acc, p) => acc + p.ekstrakurikuler.length, 0) ?? 0;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Histori Membina Ekstrakurikuler" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histori Membina Ekstrakurikuler</h1>
              {data && <p className="text-sm text-muted-foreground mt-0.5">{data.nama_pelatih}</p>}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="font-medium">Memuat histori...</p>
            </div>
          ) : !data ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
              <Trophy size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-lg">Tidak ada data histori</p>
              <p className="text-sm mt-1">Pegawai ini belum pernah menjadi pembina ekstrakurikuler.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <Card className="border-blue-200">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <CalendarIcon className="text-blue-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Periode</p>
                        <p className="text-2xl font-bold text-blue-600">{data.periode.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-emerald-200">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-100 rounded-full">
                        <Trophy className="text-emerald-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Ekskul Dibina</p>
                        <p className="text-2xl font-bold text-emerald-600">{totalEkskul}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {data.periode.map((periode) => {
                  const isOpen = expandedTahun.includes(periode.tahun_akademik);
                  return (
                    <div key={periode.tahun_akademik} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                      <button type="button" className="w-full bg-primary px-5 py-4 flex items-center justify-between hover:bg-primary/90 transition-colors" onClick={() => toggleTahun(periode.tahun_akademik)}>
                        <div className="flex items-center gap-3">
                          {isOpen ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                          <div className="text-left">
                            <span className="text-white font-bold text-lg">Tahun Akademik {periode.tahun_akademik}</span>
                            <div className="mt-0.5">
                              <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-white/20 text-white/70 text-xs"}>{periode.status_tahun_akademik}</Badge>
                            </div>
                          </div>
                        </div>
                        <span className="text-white/80 text-sm">{periode.ekstrakurikuler.length} ekskul</span>
                      </button>

                      {isOpen && (
                        <div className="p-4">
                          {periode.ekstrakurikuler.length === 0 ? (
                            <p className="text-center text-gray-400 py-4">Tidak ada ekskul pada periode ini</p>
                          ) : (
                            <div className="space-y-2">
                              {periode.ekstrakurikuler.map((ekskul) => (
                                <div key={ekskul.ekskul_id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Trophy size={16} className="text-indigo-400" />
                                    <span className="font-medium text-gray-800">{ekskul.nama_ekskul}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge className="bg-orange-100 text-orange-700 text-xs">{ekskul.status_ekskul}</Badge>
                                    <Badge className={ekskul.status_aktif_ekskul === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{ekskul.status_aktif_ekskul}</Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default HistoriPelatihEkskul;
