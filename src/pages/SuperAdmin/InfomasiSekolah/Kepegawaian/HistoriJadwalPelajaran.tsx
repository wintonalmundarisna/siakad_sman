/**
 * HistoriJadwalPelajaran
 * Route: /superadmin/informasi-akademik/jadwal-pelajaran-guru/histori/:id
 * GET /spa/jadwal-pelajaran/:id?tahun_akademik_id=X
 *
 * Response dari JadwalPelajaranController::show():
 * [{
 *   guru_id, nama, nip, nuptk,
 *   periode: [{
 *     tahun_akademik_id, tahun_akademik, status_tahun,
 *     semesters: [{
 *       semester_id, semester, status_semester,
 *       jadwal_pelajarans: [{
 *         jadwal_pelajaran_id, mata_pelajaran, hari,
 *         rombel, jurusan, tingkat,
 *         jam_mulai, jam_selesai, ruangan, link_opsional
 *       }]
 *     }]
 *   }]
 * }]
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Footer from "@/pages/Footer";
import {
  ArrowLeft, Loader2Icon, ChevronDownIcon, ChevronRightIcon,
  CalendarIcon, BookOpenIcon, ClockIcon, MapPinIcon, LinkIcon, Users,
} from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

interface JadwalItem {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string | null;
  hari: string;
  rombel: string | null;
  jurusan?: string | null;
  tingkat?: number | null;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string | null;
  link_opsional: string | null;
}

interface SemesterItem {
  semester_id: number;
  semester: string;
  status_semester: string;
  jadwal_pelajarans: JadwalItem[];
}

interface PeriodeItem {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun: string;
  semesters: SemesterItem[];
}

interface GuruData {
  guru_id: number;
  nama: string;
  nip: string | null;
  nuptk: string | null;
  periode: PeriodeItem[];
}

interface TahunOption {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status: string;
}

const HARI_ORDER: Record<string, number> = {
  Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6, Minggu: 7,
};

const HistoriJadwalPelajaran = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [tahunOptions, setTahunOptions] = useState<TahunOption[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<string>("");
  const [loadingSelect, setLoadingSelect] = useState(true);

  const [data, setData] = useState<GuruData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedTahun, setExpandedTahun] = useState<string[]>([]);
  const [expandedSemester, setExpandedSemester] = useState<string[]>([]);

  // Fetch tahun options
  useEffect(() => {
    api
      .get("/spa/data-select/jadwal-pelajaran")
      .then((res) => {
        if (res.data.status === "success") {
          const list: TahunOption[] = res.data.data.tahun_akademik ?? [];
          setTahunOptions(list);
          const aktif = list.find((t) => t.status === "aktif");
          if (aktif) setSelectedTahun(String(aktif.tahun_akademik_id));
        }
      })
      .catch(() => Swal.fire({ icon: "error", title: "Gagal memuat filter!" }))
      .finally(() => setLoadingSelect(false));
  }, []);

  // Fetch histori jadwal
  useEffect(() => {
    if (!id || !selectedTahun) return;
    setLoading(true);
    setData(null);

    api
      .get(`/spa/jadwal-pelajaran/${id}`, {
        params: { tahun_akademik_id: Number(selectedTahun) },
      })
      .then((res) => {
        if (res.data.status === "success" && res.data.data?.length > 0) {
          const d: GuruData = res.data.data[0];
          setData(d);
          setExpandedTahun(d.periode.map((p) => p.tahun_akademik));
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
          Swal.fire({ icon: "error", title: "Gagal memuat data!", text: err.response?.data?.message });
        }
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id, selectedTahun]);

  const toggleTahun = (key: string) =>
    setExpandedTahun((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const toggleSemester = (key: string) =>
    setExpandedSemester((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const totalJadwal = data?.periode.reduce((a, p) =>
    a + p.semesters.reduce((b, s) => b + s.jadwal_pelajarans.length, 0), 0) ?? 0;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Histori Jadwal Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histori Jadwal Pelajaran</h1>
              {data && <p className="text-sm text-muted-foreground mt-0.5">{data.nama}</p>}
            </div>
          </div>

          {loadingSelect ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
            </div>
          ) : (
            <>
              {/* Filter */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
                <div className="max-w-xs">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun Akademik</label>
                  <Select value={selectedTahun} onValueChange={setSelectedTahun}>
                    <SelectTrigger><SelectValue placeholder="-- pilih tahun --" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Tahun Akademik</SelectLabel>
                        {tahunOptions.map((t) => (
                          <SelectItem key={t.tahun_akademik_id} value={String(t.tahun_akademik_id)}>
                            <div className="flex items-center gap-2">
                              <span>{t.tahun_akademik}</span>
                              <Badge className={t.status === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{t.status}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-400 mt-2">Data ditampilkan berdasarkan tahun akademik yang dipilih</p>
              </div>

              {/* Statistik */}
              {!loading && data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <Card className="border-blue-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full"><CalendarIcon className="text-blue-600" size={22} /></div>
                        <div>
                          <p className="text-sm text-gray-500">Total Periode</p>
                          <p className="text-2xl font-bold text-blue-600">{data.periode.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-indigo-200">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 rounded-full"><BookOpenIcon className="text-indigo-600" size={22} /></div>
                        <div>
                          <p className="text-sm text-gray-500">Total Jadwal</p>
                          <p className="text-2xl font-bold text-indigo-600">{totalJadwal}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Loader2Icon className="animate-spin mb-3" size={32} />
                  <p className="font-medium">Memuat histori jadwal...</p>
                </div>
              ) : !data ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                  <BookOpenIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-lg">Tidak ada data jadwal</p>
                  <p className="text-sm mt-1">Guru ini belum memiliki jadwal pelajaran pada tahun akademik yang dipilih.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.periode.map((periode) => {
                    const isTahunOpen = expandedTahun.includes(periode.tahun_akademik);
                    const totalPeriode = periode.semesters.reduce((a, s) => a + s.jadwal_pelajarans.length, 0);

                    return (
                      <div key={periode.tahun_akademik} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                        <button
                          type="button"
                          className="w-full bg-primary px-5 py-4 flex items-center justify-between hover:bg-primary/90 transition-colors"
                          onClick={() => toggleTahun(periode.tahun_akademik)}
                        >
                          <div className="flex items-center gap-3">
                            {isTahunOpen ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                            <div className="text-left">
                              <span className="text-white font-bold text-lg">Tahun Akademik {periode.tahun_akademik}</span>
                              <div className="mt-0.5">
                                <Badge className={periode.status_tahun === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-white/20 text-white/70 text-xs"}>
                                  {periode.status_tahun}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <span className="text-white/80 text-sm">{totalPeriode} jadwal</span>
                        </button>

                        {isTahunOpen && (
                          <div className="p-4 space-y-3">
                            {periode.semesters.map((sem) => {
                              const semKey = `${periode.tahun_akademik}-${sem.semester}`;
                              const isSemOpen = expandedSemester.includes(semKey);
                              const sorted = [...sem.jadwal_pelajarans].sort(
                                (a, b) => (HARI_ORDER[a.hari] ?? 9) - (HARI_ORDER[b.hari] ?? 9)
                              );

                              return (
                                <div key={semKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                  <button
                                    type="button"
                                    className="w-full bg-indigo-50 px-4 py-3 flex items-center justify-between hover:bg-indigo-100 transition-colors"
                                    onClick={() => toggleSemester(semKey)}
                                  >
                                    <div className="flex items-center gap-2">
                                      {isSemOpen ? <ChevronDownIcon className="text-indigo-600" size={16} /> : <ChevronRightIcon className="text-indigo-600" size={16} />}
                                      <span className="font-semibold text-indigo-900">Semester {sem.semester}</span>
                                      <Badge className={sem.status_semester === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>
                                        {sem.status_semester}
                                      </Badge>
                                    </div>
                                    <span className="text-indigo-600 text-sm">{sem.jadwal_pelajarans.length} jadwal</span>
                                  </button>

                                  {isSemOpen && (
                                    <div className="p-3 space-y-2">
                                      {sorted.length === 0 ? (
                                        <p className="text-center text-gray-400 py-4">Tidak ada jadwal</p>
                                      ) : (
                                        sorted.map((j) => (
                                          <div key={j.jadwal_pelajaran_id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                              <div className="flex items-center gap-2">
                                                <BookOpenIcon size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                                                <span className="font-semibold text-gray-800">{j.mata_pelajaran ?? "—"}</span>
                                              </div>
                                              <Badge className="bg-indigo-100 text-indigo-700 text-xs flex-shrink-0">{j.hari}</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                              <div className="flex items-center gap-1.5">
                                                <ClockIcon size={13} className="text-gray-400" />
                                                <span>{j.jam_mulai} – {j.jam_selesai}</span>
                                              </div>
                                              <div className="flex items-center gap-1.5">
                                                <Users size={13} className="text-gray-400" />
                                                <span>{j.rombel ?? "—"}</span>
                                              </div>
                                              {j.ruangan && (
                                                <div className="flex items-center gap-1.5">
                                                  <MapPinIcon size={13} className="text-gray-400" />
                                                  <span>{j.ruangan}</span>
                                                </div>
                                              )}
                                              {j.link_opsional && (
                                                <div className="flex items-center gap-1.5 col-span-2">
                                                  <LinkIcon size={13} className="text-gray-400" />
                                                  <a href={j.link_opsional} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">
                                                    {j.link_opsional}
                                                  </a>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default HistoriJadwalPelajaran;