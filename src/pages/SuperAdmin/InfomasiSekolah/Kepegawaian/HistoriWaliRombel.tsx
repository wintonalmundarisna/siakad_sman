import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/pages/Footer";
import { ArrowLeft, Loader2Icon, ChevronDownIcon, ChevronRightIcon, CalendarIcon, Users } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

interface RombelItem {
  wali_rombel_id?: number;
  rombel: string;
  kelas?: string;
  jurusan?: string | null;
  tingkat?: number | null;
}

interface PeriodeItem {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  rombels: RombelItem[];
}

interface WaliRombelData {
  guru_id: number;
  nama_guru: string;
  periode: PeriodeItem[];
}

const HistoriWaliRombel = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState<WaliRombelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTahun, setExpandedTahun] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api
      .get("/spa/tahun-akademik")
      .then((res) => {
        const list: { id: number; tahun_akademik: string; status: string; tahun_akademik_id: number }[] = res.data.data ?? [];

        // Filter pakai field "status" bukan "status_tahun_akademik"
        const aktif = list.filter((t) => t.status === "aktif");
        const targets = aktif.length > 0 ? aktif : list;

        return Promise.allSettled(
          targets.map((t) =>
            api.get(`/spa/wali-rombel/${id}`, {
              // pakai tahun_akademik_id bukan id
              params: { tahun_akademik_id: t.tahun_akademik_id ?? null},
            }),
          ),
        );
      })
      .then((results) => {
        const allPeriode: PeriodeItem[] = [];
        let guruData: WaliRombelData | null = null;

        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value?.data?.status === "success" && result.value.data.data) {
            const d: WaliRombelData = result.value.data.data;
            if (!guruData) guruData = { ...d, periode: [] };
            allPeriode.push(...d.periode);
          }
        });

        if (guruData) {
          setData({ ...(guruData as WaliRombelData), periode: allPeriode });
          setExpandedTahun(allPeriode.map((p) => p.tahun_akademik));
        }
      })
      .catch(() => {
        Swal.fire({ icon: "error", title: "Gagal memuat data!" });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleTahun = (key: string) => setExpandedTahun((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const totalRombel = data?.periode.reduce((acc, p) => acc + (p.rombels?.length ?? 0), 0) ?? 0;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Histori Wali Rombel" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histori Menjadi Wali Rombel</h1>
              {data && <p className="text-sm text-muted-foreground mt-0.5">{data.nama_guru}</p>}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="font-medium">Memuat histori...</p>
            </div>
          ) : !data ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-lg">Tidak ada data histori</p>
              <p className="text-sm mt-1">Guru ini belum pernah menjadi wali rombel.</p>
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
                <Card className="border-purple-200">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Users className="text-purple-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Rombel Dipimpin</p>
                        <p className="text-2xl font-bold text-purple-600">{totalRombel}</p>
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
                        <span className="text-white/80 text-sm">{periode.rombels?.length ?? 0} rombel</span>
                      </button>

                      {isOpen && (
                        <div className="p-4">
                          {!periode.rombels?.length ? (
                            <p className="text-center text-gray-400 py-4">Tidak ada data rombel</p>
                          ) : (
                            <div className="space-y-2">
                              {periode.rombels?.map((rm) => (
                                <div key={rm.wali_rombel_id}>
                                  <p className="font-medium text-gray-800">{rm.rombel}</p>
                                  {(rm.kelas || rm.jurusan) && <p className="text-xs text-gray-400">{[rm.kelas, rm.jurusan].filter(Boolean).join(" · ")}</p>}
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

export default HistoriWaliRombel;
