import { useEffect, useMemo, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from "@/pages/Footer";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Loader2Icon, PlusIcon, Trash2Icon, TrophyIcon, SearchIcon, PenBoxIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TahunAkademikSelect {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
}

interface PrestasiItem {
  prestasi_id: number;
  prestasi_diraih: string;
}

interface SiswaPrestasiRow {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
  prestasi: PrestasiItem[];
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const tahunBadge = (s: string) => (s === "aktif" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600");

// ─── Main Component ───────────────────────────────────────────────────────────

const DataPrestasiSiswa = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Tahun akademik untuk filter
  const [tahunList, setTahunList] = useState<TahunAkademikSelect[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<string>("");
  const [selectLoaded, setSelectLoaded] = useState(false);

  // Data prestasi
  const [rows, setRows] = useState<SiswaPrestasiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // ── Load tahun akademik dari data-select ──────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/siswa/prestasi");
        if (res.data.status === "success") {
          const tahunData: TahunAkademikSelect[] = res.data.data.tahun_akademik ?? [];
          setTahunList(tahunData);

          const aktif = tahunData.find((t) => t.status_tahun_akademik === "aktif");
          const defaultId = aktif ? String(aktif.tahun_akademik_id) : tahunData[0] ? String(tahunData[0].tahun_akademik_id) : "";
          setSelectedTahun(defaultId);
          setSelectLoaded(true);
        }
      } catch {
        Swal.fire({ icon: "error", title: "Gagal", text: "Tidak dapat memuat data tahun akademik." });
      } finally {
        setLoadingSelect(false);
      }
    };
    load();
  }, []);

  // ── Fetch prestasi berdasarkan tahun ─────────────────────
  const fetchPrestasi = async (tahunId: string) => {
    if (!tahunId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/spa/prestasi", {
        params: { tahun_akademik_id: Number(tahunId) },
      });
      if (res.data.status === "success") {
        const periode = res.data.data?.[0];
        setRows(periode?.siswa ?? []);
      } else {
        setRows([]);
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectLoaded && selectedTahun) fetchPrestasi(selectedTahun);
  }, [selectedTahun, selectLoaded]);

  // ── Search ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const lower = searchTerm.toLowerCase();
    return rows.filter((r) => r.nama_siswa.toLowerCase().includes(lower) || r.nisn.toLowerCase().includes(lower) || r.nis.toLowerCase().includes(lower));
  }, [rows, searchTerm]);

  // ── Hapus ─────────────────────────────────────────────────
  const handleDelete = async (prestasiId: number, namaPrestasi: string) => {
    const c = await Swal.fire({
      icon: "warning",
      title: "Hapus Prestasi?",
      html: `Prestasi <b>"${namaPrestasi}"</b> akan dihapus dan tidak dapat dikembalikan.`,
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#4F46E5",
    });
    if (!c.isConfirmed) return;
    try {
      await api.delete(`/spa/prestasi/${prestasiId}`);
      Swal.fire({
        icon: "success",
        title: "Berhasil dihapus",
        timer: 1200,
        showConfirmButton: false,
      });
      await fetchPrestasi(selectedTahun);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: err.response?.data?.message ?? "Terjadi kesalahan.",
      });
    }
  };

  const selectedTahunObj = tahunList.find((t) => String(t.tahun_akademik_id) === selectedTahun);

  // ── Render ────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Prestasi Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Prestasi Siswa</h1>

          {loadingSelect ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* ── Toolbar ── */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Kiri: Tambah + Filter Tahun */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link to="/superadmin/informasi-laporan-umum/prestasi-siswa/create">
                    <Button className="bg-primary gap-2">
                      <PlusIcon size={16} /> Tambah Prestasi
                    </Button>
                  </Link>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Tahun:</span>
                    <Select value={selectedTahun} onValueChange={setSelectedTahun}>
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder="Pilih Tahun" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Tahun Akademik</SelectLabel>
                          {tahunList.map((t) => (
                            <SelectItem key={t.tahun_akademik_id} value={String(t.tahun_akademik_id)}>
                              {t.tahun_akademik}
                              {t.status_tahun_akademik === "aktif" && " (Aktif)"}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {selectedTahunObj && <Badge className={`text-xs ${tahunBadge(selectedTahunObj.status_tahun_akademik)}`}>{selectedTahunObj.status_tahun_akademik}</Badge>}
                  </div>
                </div>

                {/* Kanan: Search */}
                <div className="relative w-full md:w-64">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
                  <Input
                    placeholder="Cari nama, NISN, NIS..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                    className="pl-8 text-sm"
                  />
                </div>
              </div>

              {/* ── Data ── */}
              {loading ? (
                <div className="flex items-center justify-center h-40 text-gray-400 gap-2">
                  <Loader2Icon className="animate-spin" size={20} />
                  <span>Memuat data prestasi...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl bg-white">
                  <TrophyIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">{rows.length === 0 ? "Belum ada data prestasi pada periode ini" : "Tidak ada siswa yang sesuai pencarian"}</p>
                  {rows.length === 0 && <p className="text-sm text-gray-400 mt-1">Klik "Tambah Prestasi" untuk menambahkan</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((siswa) => (
                    <div key={siswa.siswa_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Header siswa */}
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{siswa.nama_siswa}</p>
                          <p className="text-xs text-gray-500">
                            NISN: {siswa.nisn} · NIS: {siswa.nis}
                          </p>
                        </div>
                        <Badge className="bg-indigo-100 text-indigo-700 text-xs">{siswa.prestasi.length} prestasi</Badge>
                      </div>

                      {/* List prestasi */}
                      <div className="divide-y divide-gray-50">
                        {siswa.prestasi.map((p, idx) => (
                          <div key={p.prestasi_id} className="px-5 py-3 flex items-center justify-between hover:bg-indigo-50/40 transition-colors">
                            <div className="flex items-start gap-3">
                              <TrophyIcon size={15} className="text-yellow-500 shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">
                                <span className="text-gray-400 mr-1.5">{idx + 1}.</span>
                                {p.prestasi_diraih}
                              </span>
                            </div>
                            <div className="flex gap-1.5 shrink-0 ml-4">
                              <Link
                                to={`/superadmin/informasi-laporan-umum/prestasi-siswa/edit/${p.prestasi_id}`}
                                state={{
                                  siswa_id: siswa.siswa_id,
                                  tahun_akademik_id: Number(selectedTahun),
                                  prestasi_diraih: p.prestasi_diraih,
                                }}
                              >
                                <Button size="sm" className="h-7 px-2" title="Edit prestasi">
                                  <PenBoxIcon size={12} />
                                </Button>
                              </Link>
                              <Button size="sm" className="bg-muted-foreground hover:bg-muted-foreground/90 h-7 px-2" title="Hapus prestasi" onClick={() => handleDelete(p.prestasi_id, p.prestasi_diraih)}>
                                <Trash2Icon size={12} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataPrestasiSiswa;
