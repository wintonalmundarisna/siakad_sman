/**
 * DialogDetailJadwalPelajaranGuru
 *
 * Menampilkan histori jadwal mengajar seorang guru per tahun akademik & semester.
 * Dipanggil dari halaman daftar guru (bukan dari DetailTahunAktifRombel).
 *
 * ⚠️ FIX dari versi lama:
 * - GET /spa/jadwal-pelajaran/:id BUTUH ?tahun_akademik_id (required di backend)
 * - Versi lama tidak kirim param → 422
 * - Solusi: fetch dulu semua tahun akademik dari /spa/data-select/jadwal-pelajaran,
 *   lalu fetch show() per tahun akademik dan gabungkan hasilnya
 *
 * Alternatif lebih simpel: pakai 1 tahun akademik aktif dulu,
 * lalu ada tombol untuk lihat semua tahun (fetch per TA dari selectData.tahun_akademik)
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, Loader2, ChevronDownIcon, ChevronRightIcon, RefreshCwIcon } from "lucide-react";
import api from "@/api/axios";

const toAbsoluteUrl = (url: string): string => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

// ── Types (sesuai response show() backend) ────────────────────────────────────
interface JadwalItem {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string | null;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  rombel: string | null;
  jurusan: string | null;
  tingkat: number | null;
  ruangan: string | null;
  link_opsional: string | null;
}
interface SemesterItem {
  semester_id: number;
  semester: number;
  status_semester: string;
  jadwal_pelajarans: JadwalItem[];
}
interface PeriodeItem {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun: string;
  semesters: SemesterItem[];
}
interface GuruHistori {
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

interface Props {
  guruId: number;
  namaGuru: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function DialogDetailJadwalPelajaranGuru({ guruId, namaGuru }: Props) {
  const [histori, setHistori] = useState<GuruHistori | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [expandedTA, setExpandedTA] = useState<number[]>([]);
  const [expandedSem, setExpandedSem] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [tahunOptions, setTahunOptions] = useState<TahunOption[]>([]);

  // ── Fetch tahun akademik aktif (hanya saat buka) ──────────────────────────
  // show() backend: GET /spa/jadwal-pelajaran/:id?tahun_akademik_id=X
  const fetchAktif = async () => {
    setLoading(true);
    setShowAll(false);
    try {
      // Ambil tahun akademik aktif dari select data
      const selectRes = await api.get("/spa/data-select/jadwal-pelajaran");
      if (selectRes.data.status !== "success") throw new Error("Gagal ambil select data");

      const tahuns: TahunOption[] = selectRes.data.data.tahun_akademik ?? [];
      setTahunOptions(tahuns);

      const aktif = tahuns.find((t) => t.status === "aktif");
      if (!aktif) {
        setHistori(null);
        return;
      }

      const res = await api.get(`/spa/jadwal-pelajaran/${guruId}`, {
        params: { tahun_akademik_id: aktif.tahun_akademik_id },
      });

      if (res.data.status === "success" && res.data.data.length > 0) {
        const data: GuruHistori = res.data.data[0];
        setHistori(data);

        // Auto expand tahun & semester aktif pertama
        if (data.periode.length > 0) {
          const firstTA = data.periode[0];
          setExpandedTA([firstTA.tahun_akademik_id]);
          if (firstTA.semesters.length > 0) {
            setExpandedSem([firstTA.semesters[0].semester_id]);
          }
        }
      } else {
        setHistori(null);
      }
    } catch (err: any) {
      console.error("Gagal memuat jadwal:", err);
      setHistori(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch semua tahun akademik (accordion penuh) ──────────────────────────
  const fetchSemua = async () => {
    setLoadingAll(true);
    try {
      if (tahunOptions.length === 0) {
        const selectRes = await api.get("/spa/data-select/jadwal-pelajaran");
        if (selectRes.data.status === "success") {
          setTahunOptions(selectRes.data.data.tahun_akademik ?? []);
        }
      }

      // Fetch per tahun akademik dan gabungkan periode
      const results = await Promise.allSettled(
        tahunOptions.map((t) =>
          api.get(`/spa/jadwal-pelajaran/${guruId}`, {
            params: { tahun_akademik_id: t.tahun_akademik_id },
          }),
        ),
      );

      const allPeriode: PeriodeItem[] = [];
      let guruId_: number = 0;
      let guruNama: string = namaGuru;
      let guruNip: string | null = null;
      let guruNuptk: string | null = null;
      let foundGuru = false;

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.data.status === "success") {
          const data: GuruHistori = result.value.data.data[0];
          if (!foundGuru) {
            guruId_ = data.guru_id;
            guruNama = data.nama;
            guruNip = data.nip;
            guruNuptk = data.nuptk;
            foundGuru = true;
          }
          allPeriode.push(...data.periode);
        }
      });

      if (foundGuru && allPeriode.length > 0) {
        setHistori({ guru_id: guruId_, nama: guruNama, nip: guruNip, nuptk: guruNuptk, periode: allPeriode });
        setShowAll(true);
        // Expand semua TA
        setExpandedTA(allPeriode.map((p) => p.tahun_akademik_id));
      }
    } catch (err) {
      console.error("Gagal fetch semua:", err);
    } finally {
      setLoadingAll(false);
    }
  };

  const toggleTA = (id: number) => setExpandedTA((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleSem = (id: number) => setExpandedSem((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const totalJadwal = histori?.periode.reduce((sum, p) => sum + p.semesters.reduce((s2, sem) => s2 + sem.jadwal_pelajarans.length, 0), 0) ?? 0;

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) fetchAktif();
        else {
          setHistori(null);
          setShowAll(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="Lihat histori jadwal">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[920px] max-w-[96vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Histori Jadwal Mengajar</DialogTitle>
          <DialogDescription>
            Riwayat jadwal pelajaran per tahun akademik dan semester — <span className="font-medium">{namaGuru}</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-10 text-muted-foreground">
            <Loader2 className="animate-spin mr-2" /> Memuat data...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Card Info Guru */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-indigo-500 mb-1 uppercase tracking-wide">Guru</p>
              <p className="text-lg font-bold text-indigo-900">{histori?.nama ?? namaGuru}</p>
              {histori && (
                <p className="text-sm text-indigo-700 mt-0.5">
                  NIP: {histori.nip || "-"} • NUPTK: {histori.nuptk || "-"}
                </p>
              )}
              {histori && (
                <p className="text-xs text-indigo-500 mt-1">
                  {showAll ? "Semua tahun akademik" : "Tahun akademik aktif"} • {totalJadwal} jadwal
                </p>
              )}
            </div>

            {/* Tombol lihat semua */}
            {histori && !showAll && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" disabled={loadingAll} onClick={fetchSemua} className="text-xs flex items-center gap-1">
                  {loadingAll ? <Loader2 size={14} className="animate-spin" /> : <RefreshCwIcon size={14} />}
                  Tampilkan semua tahun akademik
                </Button>
              </div>
            )}

            {/* Konten */}
            {!histori ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-base font-medium">Belum ada jadwal mengajar</p>
                <p className="text-sm mt-1">Guru ini belum memiliki jadwal pada tahun akademik aktif.</p>
              </div>
            ) : histori.periode.length === 0 ? (
              <p className="text-center text-gray-500 py-6">Tidak ada data jadwal untuk ditampilkan.</p>
            ) : (
              histori.periode.map((periode) => (
                <div key={periode.tahun_akademik_id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Header Tahun Akademik */}
                  <div
                    className={`p-3 cursor-pointer flex items-center justify-between transition-colors ${periode.status_tahun === "aktif" ? "bg-primary hover:bg-primary/90" : "bg-gray-500 hover:bg-gray-600"}`}
                    onClick={() => toggleTA(periode.tahun_akademik_id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedTA.includes(periode.tahun_akademik_id) ? <ChevronDownIcon className="text-white" size={18} /> : <ChevronRightIcon className="text-white" size={18} />}
                      <span className="text-white font-bold text-sm">{periode.tahun_akademik}</span>
                      <Badge className={`text-xs ${periode.status_tahun === "aktif" ? "bg-green-200 text-green-900" : "bg-gray-200 text-gray-800"}`}>{periode.status_tahun}</Badge>
                    </div>
                    <span className="text-white text-xs">{periode.semesters.length} semester</span>
                  </div>

                  {/* Body: daftar semester */}
                  {expandedTA.includes(periode.tahun_akademik_id) && (
                    <div className="p-2 space-y-2 bg-gray-50">
                      {periode.semesters.map((sem) => (
                        <div key={sem.semester_id} className="border border-gray-200 rounded overflow-hidden bg-white">
                          {/* Header Semester */}
                          <div
                            className={`p-2 cursor-pointer flex items-center justify-between transition-colors ${sem.status_semester === "aktif" ? "bg-blue-50 hover:bg-blue-100" : "bg-gray-100 hover:bg-gray-200"}`}
                            onClick={() => toggleSem(sem.semester_id)}
                          >
                            <div className="flex items-center gap-2">
                              {expandedSem.includes(sem.semester_id) ? <ChevronDownIcon size={15} /> : <ChevronRightIcon size={15} />}
                              <span className="font-semibold text-sm">Semester {sem.semester}</span>
                              <Badge variant="outline" className={`text-xs ${sem.status_semester === "aktif" ? "bg-green-50 text-green-700 border-green-300" : ""}`}>
                                {sem.status_semester}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500">{sem.jadwal_pelajarans.length} jadwal</span>
                          </div>

                          {/* Tabel jadwal */}
                          {expandedSem.includes(sem.semester_id) && (
                            <div className="overflow-x-auto">
                              {sem.jadwal_pelajarans.length === 0 ? (
                                <p className="text-center text-gray-400 text-sm py-4">Tidak ada jadwal di semester ini.</p>
                              ) : (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b bg-gray-50 text-xs text-gray-600">
                                      <th className="text-left p-2 font-semibold">No</th>
                                      <th className="text-left p-2 font-semibold">Mata Pelajaran</th>
                                      <th className="text-left p-2 font-semibold">Hari</th>
                                      <th className="text-left p-2 font-semibold">Jam</th>
                                      <th className="text-left p-2 font-semibold">Rombel</th>
                                      <th className="text-left p-2 font-semibold">Jurusan</th>
                                      <th className="text-left p-2 font-semibold">Tingkat</th>
                                      <th className="text-left p-2 font-semibold">Ruangan</th>
                                      <th className="text-left p-2 font-semibold">Link</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sem.jadwal_pelajarans.map((j, idx) => (
                                      <tr key={j.jadwal_pelajaran_id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 text-gray-400">{idx + 1}</td>
                                        <td className="p-2 font-medium">{j.mata_pelajaran || "-"}</td>
                                        <td className="p-2">{j.hari}</td>
                                        <td className="p-2 text-xs whitespace-nowrap">
                                          {j.jam_mulai.slice(0, 5)} – {j.jam_selesai.slice(0, 5)}
                                        </td>
                                        <td className="p-2">{j.rombel || "-"}</td>
                                        <td className="p-2 text-xs text-gray-600">{j.jurusan || "-"}</td>
                                        <td className="p-2">
                                          {j.tingkat != null && (
                                            <Badge variant="outline" className="text-xs">
                                              {j.tingkat}
                                            </Badge>
                                          )}
                                        </td>
                                        <td className="p-2 text-xs">{j.ruangan || "-"}</td>
                                        <td className="p-2 text-xs">
                                          {j.link_opsional ? (
                                            <a href={toAbsoluteUrl(j.link_opsional)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                              Link
                                            </a>
                                          ) : (
                                            "-"
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
