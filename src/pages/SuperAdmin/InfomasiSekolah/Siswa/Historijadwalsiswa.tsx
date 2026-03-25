import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/pages/Footer";
import { ArrowLeft, Loader2Icon, ChevronDownIcon, ChevronRightIcon, CalendarIcon, BookOpenIcon, ClockIcon, MapPinIcon, UserIcon, LinkIcon } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ─────────────────────────────────────────────────────────────────────
interface JadwalPelajaranItem {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string | null;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  guru: string | null;
  ruangan: string | null;
  link_opsional: string | null;
}

interface SemesterItem {
  semester_id: number;
  semester: string;
  status_semester: string;
  jadwal_pelajarans: JadwalPelajaranItem[];
}

interface RombelInfo {
  rombel_id: number;
  nama_rombel: string;
  kelas: string | null;
  wali_rombel: string | null;
}

interface PeriodeItem {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  rombel: RombelInfo | null;
  jadwal: SemesterItem[];
}

interface SiswaData {
  siswa_id: number;
  nama_siswa: string;
  periode: PeriodeItem[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const HARI_ORDER: Record<string, number> = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Minggu: 7,
};

const formatJam = (jam: string) => jam?.slice(0, 5) ?? "—";

// ── Component ─────────────────────────────────────────────────────────────────
const HistoriJadwalSiswa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [data, setData] = useState<SiswaData | null>(null);
  const [loading, setLoading] = useState(true);

  const [expandedTahun, setExpandedTahun] = useState<number[]>([]);
  const [expandedSemester, setExpandedSemester] = useState<string[]>([]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api
      .get(`/spa/siswa/jadwal-pelajaran/${id}`)
      .then((res) => {
        if (res.data.status === "success" && res.data.data) {
          const d: SiswaData = res.data.data;
          setData(d);

          // Auto-expand tahun aktif
          const aktifIds = d.periode.filter((p) => p.status_tahun_akademik === "aktif").map((p) => p.tahun_akademik_id);
          setExpandedTahun(aktifIds.length ? aktifIds : [d.periode[0]?.tahun_akademik_id]);

          // Auto-expand semester aktif
          const aktifSemKeys: string[] = [];
          d.periode.forEach((p) => {
            p.jadwal.forEach((s) => {
              if (s.status_semester === "aktif") {
                aktifSemKeys.push(`${p.tahun_akademik_id}-${s.semester_id}`);
              }
            });
          });
          setExpandedSemester(aktifSemKeys);
        }
      })
      .catch((err) => {
        Swal.fire({ icon: "error", title: "Gagal memuat data!", text: err.response?.data?.message });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleTahun = (tahunId: number) => setExpandedTahun((prev) => (prev.includes(tahunId) ? prev.filter((k) => k !== tahunId) : [...prev, tahunId]));

  const toggleSemester = (key: string) => setExpandedSemester((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const totalJadwal = data?.periode.reduce((a, p) => a + p.jadwal.reduce((b, s) => b + s.jadwal_pelajarans.length, 0), 0) ?? 0;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Histori Jadwal Pelajaran Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histori Jadwal Pelajaran</h1>
              {data && <p className="text-sm text-muted-foreground mt-0.5">{data.nama_siswa}</p>}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="font-medium">Memuat data...</p>
            </div>
          ) : !data || data.periode.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
              <BookOpenIcon size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-lg">Tidak ada data jadwal</p>
              <p className="text-sm mt-1">Siswa ini belum memiliki jadwal pelajaran.</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
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
                <Card className="border-indigo-200">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-100 rounded-full">
                        <BookOpenIcon className="text-indigo-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Jadwal</p>
                        <p className="text-2xl font-bold text-indigo-600">{totalJadwal}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Accordion Tahun */}
              <div className="space-y-4">
                {data.periode.map((periode) => {
                  const isTahunOpen = expandedTahun.includes(periode.tahun_akademik_id);
                  const totalPeriode = periode.jadwal.reduce((a, s) => a + s.jadwal_pelajarans.length, 0);

                  return (
                    <div key={periode.tahun_akademik_id} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                      {/* Tahun Header */}
                      <button type="button" className="w-full bg-primary px-5 py-4 flex items-center justify-between hover:bg-primary/90 transition-colors" onClick={() => toggleTahun(periode.tahun_akademik_id)}>
                        <div className="flex items-center gap-3">
                          {isTahunOpen ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                          <div className="text-left">
                            <span className="text-white font-bold text-lg">Tahun Akademik {periode.tahun_akademik}</span>
                            <div className="mt-0.5 flex items-center gap-2">
                              <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-white/20 text-white/80 text-xs"}>{periode.status_tahun_akademik}</Badge>
                              {periode.rombel && (
                                <span className="text-white/70 text-xs">
                                  {periode.rombel.nama_rombel} · {periode.rombel.kelas}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-white/80 text-sm">{totalPeriode} jadwal</span>
                      </button>

                      {/* Tahun Body */}
                      {isTahunOpen && (
                        <div className="p-4 space-y-3">
                          {/* Info Rombel */}
                          {periode.rombel && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 flex flex-wrap gap-x-6 gap-y-1 text-sm text-blue-800">
                              <span>
                                <strong>Rombel:</strong> {periode.rombel.nama_rombel}
                              </span>
                              {periode.rombel.kelas && (
                                <span>
                                  <strong>Kelas:</strong> {periode.rombel.kelas}
                                </span>
                              )}
                              {periode.rombel.wali_rombel && (
                                <span>
                                  <strong>Wali:</strong> {periode.rombel.wali_rombel}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Accordion Semester */}
                          {periode.jadwal.map((sem) => {
                            const semKey = `${periode.tahun_akademik_id}-${sem.semester_id}`;
                            const isSemOpen = expandedSemester.includes(semKey);
                            const sorted = [...sem.jadwal_pelajarans].sort((a, b) => (HARI_ORDER[a.hari] ?? 9) - (HARI_ORDER[b.hari] ?? 9));

                            return (
                              <div key={semKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Semester Header */}
                                <button type="button" className="w-full bg-indigo-50 px-4 py-3 flex items-center justify-between hover:bg-indigo-100 transition-colors" onClick={() => toggleSemester(semKey)}>
                                  <div className="flex items-center gap-2">
                                    {isSemOpen ? <ChevronDownIcon className="text-indigo-600" size={16} /> : <ChevronRightIcon className="text-indigo-600" size={16} />}
                                    <span className="font-semibold text-indigo-900">Semester {sem.semester}</span>
                                    <Badge className={sem.status_semester === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{sem.status_semester}</Badge>
                                  </div>
                                  <span className="text-indigo-600 text-sm">{sem.jadwal_pelajarans.length} jadwal</span>
                                </button>

                                {/* Semester Body */}
                                {isSemOpen && (
                                  <div className="p-3 space-y-2">
                                    {sorted.length === 0 ? (
                                      <p className="text-center text-gray-400 py-4 text-sm">Tidak ada jadwal pada semester ini.</p>
                                    ) : (
                                      sorted.map((j) => (
                                        <div key={j.jadwal_pelajaran_id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                          {/* Mata Pelajaran + Hari */}
                                          <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                              <BookOpenIcon size={15} className="text-indigo-400 flex-shrink-0" />
                                              <span className="font-semibold text-gray-800">{j.mata_pelajaran ?? "—"}</span>
                                            </div>
                                            <Badge className="bg-indigo-100 text-indigo-700 text-xs flex-shrink-0">{j.hari}</Badge>
                                          </div>

                                          {/* Detail */}
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                              <ClockIcon size={13} className="text-gray-400" />
                                              <span>
                                                {formatJam(j.jam_mulai)} – {formatJam(j.jam_selesai)}
                                              </span>
                                            </div>
                                            {j.guru && (
                                              <div className="flex items-center gap-1.5">
                                                <UserIcon size={13} className="text-gray-400" />
                                                <span>{j.guru}</span>
                                              </div>
                                            )}
                                            {j.ruangan && (
                                              <div className="flex items-center gap-1.5">
                                                <MapPinIcon size={13} className="text-gray-400" />
                                                <span>{j.ruangan}</span>
                                              </div>
                                            )}
                                            {j.link_opsional && (
                                              <div className="flex items-center gap-1.5 col-span-2">
                                                <LinkIcon size={13} className="text-gray-400 flex-shrink-0" />

                                                <a href={j.link_opsional.startsWith("http") ? j.link_opsional : `https://${j.link_opsional}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate text-xs">
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
            </>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default HistoriJadwalSiswa;
