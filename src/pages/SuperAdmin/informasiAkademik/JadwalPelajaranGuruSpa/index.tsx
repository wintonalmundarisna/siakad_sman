/**
 * DataJadwalPelajaranGuruSpa
 * Route: /superadmin/informasi-akademik/jadwal-pelajaran-guru
 *
 * Tujuan: Monitoring/pengecekan semua jadwal pelajaran guru oleh super admin.
 * Read-only — CRUD jadwal dilakukan di DetailTahunAktifRombelKelas (nested rombel).
 *
 * Backend:
 *  - GET /spa/jadwal-pelajaran?tahun_akademik_id=X  → data jadwal (wajib ada param)
 *  - GET /spa/data-select/jadwal-pelajaran          → ambil list tahun_akademik untuk filter
 *
 * Struktur response:
 *  [{ tahun_akademik_id, tahun_akademik,
 *     semesters: [{ semester_id, semester,
 *       gurus: [{ guru_id, guru,
 *         jadwals: [{ jadwal_pelajaran_id, mata_pelajaran, hari,
 *                     jam_mulai, jam_selesai, rombel, jurusan,
 *                     ruangan, link_opsional }] }] }] }]
 */
import { useEffect, useMemo, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Footer from "@/pages/Footer";
import { Loader2Icon, SearchIcon, ChevronDownIcon, ChevronRightIcon, CalendarIcon, BookOpenIcon, UserIcon, ClockIcon, MapPinIcon, LinkIcon } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/api/axios";
import Swal from "sweetalert2";

// ── Types ─────────────────────────────────────────────────────────────────────
interface JadwalItem {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  rombel: string;
  jurusan: string | null;
  ruangan: string | null;
  link_opsional: string | null;
}

interface GuruGroup {
  guru_id: number;
  guru: string;
  jadwals: JadwalItem[];
}

interface SemesterGroup {
  semester_id: number;
  semester: string;
  gurus: GuruGroup[];
}

interface TahunAkademikGroup {
  tahun_akademik_id: number;
  tahun_akademik: string;
  semesters: SemesterGroup[];
}

interface TahunOption {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const URUTAN_HARI: Record<string, number> = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Minggu: 7,
};

/** Pastikan URL punya protocol agar tidak dianggap relative path */
const toAbsoluteUrl = (url: string): string => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const hariBadge = (hari: string) => {
  const map: Record<string, string> = {
    Senin: "bg-blue-100 text-blue-700",
    Selasa: "bg-indigo-100 text-indigo-700",
    Rabu: "bg-emerald-100 text-emerald-700",
    Kamis: "bg-amber-100 text-amber-700",
    Jumat: "bg-orange-100 text-orange-700",
    Sabtu: "bg-purple-100 text-purple-700",
    Minggu: "bg-red-100 text-red-700",
  };
  return map[hari] ?? "bg-gray-100 text-gray-600";
};

// ── Component ─────────────────────────────────────────────────────────────────
const DataJadwalPelajaranGuruSpa = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tahunOptions, setTahunOptions] = useState<TahunOption[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<string>("");
  const [dataJadwal, setDataJadwal] = useState<TahunAkademikGroup[]>([]);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Accordion state
  const [expandedSemester, setExpandedSemester] = useState<number[]>([]);
  const [expandedGuru, setExpandedGuru] = useState<number[]>([]);

  // ── Fetch dropdown tahun akademik ──────────────────────────────────────────
  useEffect(() => {
    api
      .get("/spa/data-select/jadwal-pelajaran")
      .then((res) => {
        if (res.data.status === "success") {
          const list: TahunOption[] = res.data.data.tahun_akademik ?? [];
          setTahunOptions(list);
          // Auto-select tahun yang aktif
          const aktif = list.find((t) => t.status === "aktif");
          if (aktif) setSelectedTahun(String(aktif.tahun_akademik_id));
        }
      })
      .catch(() => {
        Swal.fire({ icon: "error", title: "Gagal memuat filter!" });
      })
      .finally(() => setLoadingSelect(false));
  }, []);

  // ── Fetch data jadwal saat tahun dipilih ──────────────────────────────────
  useEffect(() => {
    if (!selectedTahun) return;

    setLoadingData(true);
    setDataJadwal([]);
    setExpandedSemester([]);
    setExpandedGuru([]);
    setSearchTerm("");

    api
      .get("/spa/jadwal-pelajaran", {
        params: { tahun_akademik_id: Number(selectedTahun) },
      })
      .then((res) => {
        if (res.data.status === "success") {
          setDataJadwal(res.data.data);
          // Auto-expand semester pertama
          const firstTA = res.data.data[0];
          if (firstTA?.semesters?.length > 0) {
            setExpandedSemester([firstTA.semesters[0].semester_id]);
          }
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat jadwal!",
            text: err.response?.data?.message || "Tidak dapat memuat data jadwal.",
          });
        }
        // 404 = belum ada jadwal, tampilkan kosong
        setDataJadwal([]);
      })
      .finally(() => setLoadingData(false));
  }, [selectedTahun]);

  // ── Accordion helpers ─────────────────────────────────────────────────────
  const toggleSemester = (id: number) => setExpandedSemester((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const toggleGuru = (id: number) => setExpandedGuru((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  // ── Flatten untuk search & statistik ─────────────────────────────────────
  const allJadwal = useMemo(() => {
    const result: (JadwalItem & { guru: string; guru_id: number; semester: string })[] = [];
    dataJadwal.forEach((ta) => ta.semesters.forEach((sem) => sem.gurus.forEach((g) => g.jadwals.forEach((j) => result.push({ ...j, guru: g.guru, guru_id: g.guru_id, semester: sem.semester })))));
    return result;
  }, [dataJadwal]);

  // ── Filter data berdasarkan searchTerm ────────────────────────────────────
  const filteredData = useMemo((): TahunAkademikGroup[] => {
    if (!searchTerm.trim()) return dataJadwal;
    const lower = searchTerm.toLowerCase();

    return dataJadwal
      .map((ta) => ({
        ...ta,
        semesters: ta.semesters
          .map((sem) => ({
            ...sem,
            gurus: sem.gurus
              .map((g) => ({
                ...g,
                jadwals: g.jadwals.filter(
                  (j) =>
                    j.mata_pelajaran.toLowerCase().includes(lower) ||
                    j.hari.toLowerCase().includes(lower) ||
                    j.rombel.toLowerCase().includes(lower) ||
                    g.guru.toLowerCase().includes(lower) ||
                    (j.ruangan ?? "").toLowerCase().includes(lower) ||
                    (j.jurusan ?? "").toLowerCase().includes(lower),
                ),
              }))
              .filter((g) => g.jadwals.length > 0),
          }))
          .filter((sem) => sem.gurus.length > 0),
      }))
      .filter((ta) => ta.semesters.length > 0);
  }, [dataJadwal, searchTerm]);

  // ── Statistik ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalJadwal = allJadwal.length;
    const totalGuru = new Set(allJadwal.map((j) => j.guru_id)).size;
    const totalRombel = new Set(allJadwal.map((j) => j.rombel)).size;
    const totalMapel = new Set(allJadwal.map((j) => j.mata_pelajaran)).size;
    return { totalJadwal, totalGuru, totalRombel, totalMapel };
  }, [allJadwal]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Jadwal Pelajaran Guru" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Jadwal Pelajaran Guru</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitoring dan pengecekan seluruh jadwal mengajar guru per tahun akademik</p>
          </div>

          {loadingSelect ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="font-medium">Memuat filter...</p>
            </div>
          ) : (
            <>
              {/* ── Filter & Search ── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
                <div className="flex flex-col md:flex-row gap-3 items-end">
                  {/* Filter Tahun Akademik */}
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun Akademik</label>
                    <Select value={selectedTahun} onValueChange={(v) => setSelectedTahun(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="-- pilih tahun akademik --" />
                      </SelectTrigger>
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

                  {/* Search */}
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cari</label>
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                      <Input placeholder="Cari guru, mata pelajaran, rombel, hari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" disabled={!selectedTahun || loadingData} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Statistik ── */}
              {!loadingData && dataJadwal.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Total Jadwal", value: stats.totalJadwal, icon: CalendarIcon, color: "bg-blue-50 text-blue-700 border-blue-200" },
                    { label: "Guru Mengajar", value: stats.totalGuru, icon: UserIcon, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { label: "Rombel", value: stats.totalRombel, icon: BookOpenIcon, color: "bg-amber-50 text-amber-700 border-amber-200" },
                    { label: "Mata Pelajaran", value: stats.totalMapel, icon: BookOpenIcon, color: "bg-purple-50 text-purple-700 border-purple-200" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`rounded-xl border p-4 ${color}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} />
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                      <p className="text-2xl font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Loading Data ── */}
              {loadingData ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Loader2Icon className="animate-spin mb-3" size={32} />
                  <p className="font-medium">Memuat jadwal...</p>
                </div>
              ) : !selectedTahun ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                  <CalendarIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Pilih tahun akademik untuk melihat jadwal</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                  <CalendarIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-lg">{searchTerm ? "Tidak ada jadwal yang sesuai pencarian" : "Belum ada jadwal pada tahun akademik ini"}</p>
                  {searchTerm && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setSearchTerm("")}>
                      Reset pencarian
                    </Button>
                  )}
                </div>
              ) : (
                /* ── Konten Accordion ── */
                filteredData.map((ta) => (
                  <div key={ta.tahun_akademik_id} className="space-y-4">
                    {ta.semesters.map((sem) => {
                      const totalJadwalSem = sem.gurus.reduce((a, g) => a + g.jadwals.length, 0);
                      const isExpanded = expandedSemester.includes(sem.semester_id);

                      return (
                        <div key={sem.semester_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
                          {/* ── Header Semester ── */}
                          <button type="button" className="w-full bg-primary px-5 py-4 flex items-center justify-between hover:bg-primary/90 transition-colors" onClick={() => toggleSemester(sem.semester_id)}>
                            <div className="flex items-center gap-3">
                              {isExpanded ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                              <div className="text-left">
                                <p className="text-white font-bold text-base">Semester {sem.semester}</p>
                                <p className="text-white/70 text-xs mt-0.5">{ta.tahun_akademik}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{sem.gurus.length} guru</p>
                              <p className="text-white/70 text-xs">{totalJadwalSem} jadwal</p>
                            </div>
                          </button>

                          {/* ── List Guru ── */}
                          {isExpanded && (
                            <div className="p-4 space-y-3">
                              {sem.gurus.map((guru) => {
                                const isGuruExpanded = expandedGuru.includes(guru.guru_id);
                                // Sort jadwal by hari → jam mulai
                                const sortedJadwals = [...guru.jadwals].sort((a, b) => {
                                  const hariDiff = (URUTAN_HARI[a.hari] ?? 9) - (URUTAN_HARI[b.hari] ?? 9);
                                  if (hariDiff !== 0) return hariDiff;
                                  return a.jam_mulai.localeCompare(b.jam_mulai);
                                });

                                return (
                                  <div key={guru.guru_id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* ── Header Guru ── */}
                                    <button type="button" className="w-full bg-indigo-50 px-4 py-3 flex items-center justify-between hover:bg-indigo-100 transition-colors" onClick={() => toggleGuru(guru.guru_id)}>
                                      <div className="flex items-center gap-3">
                                        {isGuruExpanded ? <ChevronDownIcon className="text-indigo-600" size={16} /> : <ChevronRightIcon className="text-indigo-600" size={16} />}
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center">
                                            <UserIcon size={14} className="text-indigo-700" />
                                          </div>
                                          <span className="font-semibold text-indigo-900 text-sm">{guru.guru}</span>
                                        </div>
                                      </div>
                                      <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-xs">{guru.jadwals.length} jadwal</Badge>
                                    </button>

                                    {/* ── Tabel Jadwal ── */}
                                    {isGuruExpanded && (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                          <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-10">No</th>
                                              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Mata Pelajaran</th>
                                              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-24">Hari</th>
                                              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-32">Jam</th>
                                              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Rombel</th>
                                              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-28">Ruangan</th>
                                              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-20">Link</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {sortedJadwals.map((jadwal, idx) => (
                                              <tr key={jadwal.jadwal_pelajaran_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-center text-gray-400 text-xs font-medium">{idx + 1}</td>
                                                <td className="px-4 py-3">
                                                  <span className="font-medium text-gray-900">{jadwal.mata_pelajaran}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                  <Badge className={`${hariBadge(jadwal.hari)} text-xs hover:opacity-100`}>{jadwal.hari}</Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                  <div className="flex items-center gap-1 text-gray-700">
                                                    <ClockIcon size={12} className="text-gray-400" />
                                                    <span className="text-xs font-mono">
                                                      {jadwal.jam_mulai.slice(0, 5)} – {jadwal.jam_selesai.slice(0, 5)}
                                                    </span>
                                                  </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                  <span className="text-gray-800 font-medium">{jadwal.rombel}</span>
                                                  {jadwal.jurusan && <span className="text-gray-400 text-xs block">{jadwal.jurusan}</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                  {jadwal.ruangan ? (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                      <MapPinIcon size={12} className="text-gray-400" />
                                                      <span className="text-xs">{jadwal.ruangan}</span>
                                                    </div>
                                                  ) : (
                                                    <span className="text-gray-300 text-xs">—</span>
                                                  )}
                                                </td>
                                                <td className="px-4 py-3">
                                                  {jadwal.link_opsional ? (
                                                    <a
                                                      href={toAbsoluteUrl(jadwal.link_opsional!)}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      title={jadwal.link_opsional ?? ""}
                                                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs underline underline-offset-2"
                                                    >
                                                      <LinkIcon size={11} />
                                                      Link
                                                    </a>
                                                  ) : (
                                                    <span className="text-gray-300 text-xs">—</span>
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
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
                ))
              )}
            </>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataJadwalPelajaranGuruSpa;
