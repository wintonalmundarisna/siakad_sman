import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Loader2Icon, PlusIcon, PencilIcon, Trash2Icon, UserIcon, UsersIcon, TrophyIcon, ChevronLeftIcon } from "lucide-react";
import { formatRupiah } from "@/utils/formatRupiah";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TahunAkademikOption {
  id: number;
  tahun_akademik: string;
  status: "aktif" | "arsip";
}

// Data dasar ekskul — diambil dari GET /spa/ekstrakurikuler (index)
interface EkskulBase {
  id: number;
  nama_ekskul: string;
  anggaran: number;
  status: "wajib" | "pilihan" | "jurusan";
  status_aktif: "aktif" | "arsip";
}

interface PembinaAnggota {
  pembina_id: number | null;
  pembina_pivot_id: number | null;
  nama_pembina: string | null;
  tahun_membina: string | null;
}

interface PelatihAnggota {
  pelatih_id: number | null;
  pelatih_pivot_id: number | null;
  nama_pelatih: string | null;
  tahun_melatih: string | null;
}

interface SiswaAnggota {
  siswa_id: number;
  siswa_pivot_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
  sikap: string | null;
  status: string | null;
  tahun_akademik: string;
}

// Data periode — diambil dari GET /spa/ekstrakurikuler/{id}?tahun_akademik_id=...
// Bisa null kalau ekskul belum punya anggota di periode tersebut
interface PeriodeData {
  tahun_akademik_id: number;
  tahun_akademik: string | null;
  status_tahun_akademik: "aktif" | "arsip" | null;
  anggota: {
    pembina: PembinaAnggota;
    pelatih: PelatihAnggota;
    siswa: SiswaAnggota[];
  };
}

interface PembinaSelectItem {
  pembina_id: number;
  nama_pembina: string;
  nip: string;
  nuptk: string;
  role: string;
}

interface PelatihSelectItem {
  pelatih_id: number;
  nama_pelatih: string;
  nip: string;
  nuptk: string;
  role: string;
}

interface SiswaSelectItem {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
}

// ─── Modal state types ────────────────────────────────────────────────────────

type ModalType =
  | { kind: "tambah-pembina" }
  | { kind: "edit-pembina"; pivot_id: number; current_pembina_id: number; nama_pembina: string }
  | { kind: "tambah-pelatih" }
  | { kind: "edit-pelatih"; pivot_id: number; current_pelatih_id: number; nama_pelatih: string }
  | { kind: "tambah-siswa" }
  | { kind: "edit-siswa"; pivot_id: number; siswa_id: number; nama_siswa: string; sikap: string | null; status: string | null }
  | null;

const SIKAP_OPTIONS = ["Sangat Baik", "Baik", "Cukup", "Kurang"] as const;
const STATUS_OPTIONS = ["Aktif", "Cukup Aktif", "Kurang Aktif", "Tidak Aktif"] as const;

// ─── Badge helpers ────────────────────────────────────────────────────────────

const statusEkskulBadge = (s: string) => {
  if (s === "wajib") return "bg-red-100 text-red-800";
  if (s === "pilihan") return "bg-blue-100 text-blue-800";
  return "bg-purple-100 text-purple-800";
};

const statusAktifBadge = (s: string) => (s === "aktif" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600");

const tahunStatusBadge = (s: string) => (s === "aktif" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600");

const sikapBadge = (s: string) => {
  if (s === "Sangat Baik") return "bg-green-100 text-green-800";
  if (s === "Baik") return "bg-blue-100 text-blue-800";
  if (s === "Cukup") return "bg-yellow-100 text-yellow-800";
  if (s === "Kurang") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-400";
};

const statusSiswaBadge = (s: string) => {
  if (s === "Aktif") return "bg-green-100 text-green-800";
  if (s === "Cukup Aktif") return "bg-blue-100 text-blue-800";
  if (s === "Kurang Aktif") return "bg-yellow-100 text-yellow-800";
  if (s === "Tidak Aktif") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-400";
};

const roleBadge = (role: string) => (role === "guru" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800");

// ─── Modal Component ─────────────────────────────────────────────────────────

interface ModalProps {
  modal: Exclude<ModalType, null>;
  pembinaList: PembinaSelectItem[];
  pelatihList: PelatihSelectItem[];
  siswaList: SiswaSelectItem[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
}

const InlineModal = ({ modal, pembinaList, pelatihList, siswaList, isSaving, onClose, onSave }: ModalProps) => {
  const [selectedPembina, setSelectedPembina] = useState(modal.kind === "edit-pembina" ? String(modal.current_pembina_id) : "");
  const [selectedPelatih, setSelectedPelatih] = useState(modal.kind === "edit-pelatih" ? String(modal.current_pelatih_id) : "");
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const [sikap, setSikap] = useState(modal.kind === "edit-siswa" ? (modal.sikap ?? "") : "");
  const [statusKehadiran, setStatusKehadiran] = useState(modal.kind === "edit-siswa" ? (modal.status ?? "") : "");

  const handleSubmit = () => {
    if (modal.kind === "tambah-pembina") {
      if (!selectedPembina) {
        Swal.fire({ icon: "warning", title: "Pilih pembina terlebih dahulu" });
        return;
      }
      onSave({ pembina_id: Number(selectedPembina) });
    } else if (modal.kind === "edit-pembina") {
      if (!selectedPembina) {
        Swal.fire({ icon: "warning", title: "Pilih pembina terlebih dahulu" });
        return;
      }
      onSave({ pembina_id: Number(selectedPembina) });
    } else if (modal.kind === "tambah-pelatih") {
      if (!selectedPelatih) {
        Swal.fire({ icon: "warning", title: "Pilih pelatih terlebih dahulu" });
        return;
      }
      onSave({ pelatih_id: Number(selectedPelatih) });
    } else if (modal.kind === "edit-pelatih") {
      if (!selectedPelatih) {
        Swal.fire({ icon: "warning", title: "Pilih pelatih terlebih dahulu" });
        return;
      }
      onSave({ pelatih_id: Number(selectedPelatih) });
    } else if (modal.kind === "tambah-siswa") {
      if (!selectedSiswa) {
        Swal.fire({ icon: "warning", title: "Pilih siswa terlebih dahulu" });
        return;
      }
      onSave({ siswa_id: Number(selectedSiswa) });
    } else if (modal.kind === "edit-siswa") {
      onSave({ sikap: sikap || undefined, status: statusKehadiran || undefined });
    }
  };

  const title =
    modal.kind === "tambah-pembina"
      ? "Tambah Pembina"
      : modal.kind === "edit-pembina"
        ? "Ganti Pembina"
        : modal.kind === "tambah-pelatih"
          ? "Tambah Pelatih"
          : modal.kind === "edit-pelatih"
            ? "Ganti Pelatih"
            : modal.kind === "tambah-siswa"
              ? "Daftarkan Siswa"
              : "Edit Penilaian Siswa";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">{title}</h2>

        <div className="space-y-4">
          {/* Tambah / Edit Pembina */}
          {(modal.kind === "tambah-pembina" || modal.kind === "edit-pembina") && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Pembina <span className="text-red-500">*</span>
              </label>
              {modal.kind === "edit-pembina" && (
                <p className="text-xs text-gray-500 mb-2">
                  Saat ini: <span className="font-medium text-gray-700">{modal.nama_pembina}</span>
                </p>
              )}
              <Select value={selectedPembina} onValueChange={setSelectedPembina} disabled={isSaving}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Pembina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Guru & Staff Aktif</SelectLabel>
                    {pembinaList.map((p) => (
                      <SelectItem key={p.pembina_id} value={String(p.pembina_id)}>
                        {p.nama_pembina} ({p.role})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {selectedPembina &&
                (() => {
                  const p = pembinaList.find((x) => String(x.pembina_id) === selectedPembina);
                  return p ? (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800 flex items-center gap-2">
                      <span className="font-medium">{p.nama_pembina}</span>
                      <span>· NIP: {p.nip}</span>
                      <Badge className={`text-xs ${roleBadge(p.role)}`}>{p.role}</Badge>
                    </div>
                  ) : null;
                })()}
            </div>
          )}

          {/* Tambah / Edit Pelatih */}
          {(modal.kind === "tambah-pelatih" || modal.kind === "edit-pelatih") && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Pelatih <span className="text-red-500">*</span>
              </label>
              {modal.kind === "edit-pelatih" && (
                <p className="text-xs text-gray-500 mb-2">
                  Saat ini: <span className="font-medium text-gray-700">{modal.nama_pelatih}</span>
                </p>
              )}
              <Select value={selectedPelatih} onValueChange={setSelectedPelatih} disabled={isSaving}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Pelatih" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Guru & Staff Aktif</SelectLabel>
                    {pelatihList.map((p) => (
                      <SelectItem key={p.pelatih_id} value={String(p.pelatih_id)}>
                        {p.nama_pelatih} ({p.role})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {selectedPelatih &&
                (() => {
                  const p = pelatihList.find((x) => String(x.pelatih_id) === selectedPelatih);
                  return p ? (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800 flex items-center gap-2">
                      <span className="font-medium">{p.nama_pelatih}</span>
                      <span>· NIP: {p.nip}</span>
                      <Badge className={`text-xs ${roleBadge(p.role)}`}>{p.role}</Badge>
                    </div>
                  ) : null;
                })()}
            </div>
          )}

          {/* Tambah Siswa */}
          {modal.kind === "tambah-siswa" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Siswa <span className="text-red-500">*</span>
              </label>
              <Select value={selectedSiswa} onValueChange={setSelectedSiswa} disabled={isSaving}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Siswa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Siswa Aktif</SelectLabel>
                    {siswaList.map((s) => (
                      <SelectItem key={s.siswa_id} value={String(s.siswa_id)}>
                        {s.nama_siswa} — NIS {s.nis}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {selectedSiswa &&
                (() => {
                  const s = siswaList.find((x) => String(x.siswa_id) === selectedSiswa);
                  return s ? (
                    <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
                      <span className="font-medium">{s.nama_siswa}</span> · NISN: {s.nisn} · NIS: {s.nis}
                    </div>
                  ) : null;
                })()}
            </div>
          )}

          {/* Edit Siswa */}
          {modal.kind === "edit-siswa" && (
            <>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                <p className="font-semibold">{modal.nama_siswa}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sikap</label>
                <Select value={sikap} onValueChange={setSikap} disabled={isSaving}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Sikap" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Nilai Sikap</SelectLabel>
                      {SIKAP_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status Kehadiran</label>
                <Select value={statusKehadiran} onValueChange={setStatusKehadiran} disabled={isSaving}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Status Kehadiran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSubmit} disabled={isSaving} className="bg-primary flex-1">
            {isSaving ? (
              <>
                <Loader2Icon className="animate-spin mr-1" size={16} /> Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
          <Button onClick={onClose} disabled={isSaving} variant="outline" className="flex-1">
            Batal
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DetailEkstrakurikuler = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dua state terpisah: info dasar ekskul vs data periode
  const [ekskulBase, setEkskulBase] = useState<EkskulBase | null>(null);
  const [periodeData, setPeriodeData] = useState<PeriodeData | null>(null);
  const [periodeLoading, setPeriodeLoading] = useState(false);

  const [tahunOptions, setTahunOptions] = useState<TahunAkademikOption[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<string>("");

  // Data select untuk modal
  const [pembinaList, setPembinaList] = useState<PembinaSelectItem[]>([]);
  const [pelatihList, setPelatihList] = useState<PelatihSelectItem[]>([]);
  const [siswaList, setSiswaList] = useState<SiswaSelectItem[]>([]);
  const [selectLoaded, setSelectLoaded] = useState(false);

  const [modal, setModal] = useState<ModalType>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Step 1: Ambil info dasar ekskul dari index, filter by id ──────
  const fetchEkskulBase = useCallback(async (): Promise<EkskulBase | null> => {
    try {
      const res = await api.get("/spa/ekstrakurikuler");
      const list: any[] = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      const found = list.find((e: any) => String(e.id) === String(id));
      if (!found) return null;
      return {
        id: found.id,
        nama_ekskul: found.nama_ekskul,
        anggaran: found.anggaran ?? 0,
        status: found.status,
        status_aktif: found.status_aktif,
      };
    } catch {
      return null;
    }
  }, [id]);

  // ── Step 2: Ambil list tahun akademik ─────────────────────────────
  // Helper: unwrap semua kemungkinan struktur response Laravel
  const unwrapArray = (data: any): any[] => {
    if (Array.isArray(data)) return data; // langsung array
    if (Array.isArray(data?.data)) return data.data; // { data: [...] }
    if (Array.isArray(data?.data?.data)) return data.data.data; // { data: { data: [...] } } (paginated)
    return [];
  };

  const fetchTahunAkademik = useCallback(async (): Promise<string> => {
    try {
      const res = await api.get("/spa/tahun-akademik");

      const raw = unwrapArray(res.data);
      // Debug: lihat key lengkap dari item pertama
      if (raw.length > 0) console.log("[TahunAkademik] keys:", Object.keys(raw[0]), "| item[0]:", raw[0]);

      if (raw.length === 0) return "";

      const list: TahunAkademikOption[] = raw
        .map((t: any) => {
          // Backend pakai tahun_akademik_id ATAU id
          const rawId = t.tahun_akademik_id ?? t.id;
          // Nama tahun: coba semua kemungkinan field
          const label = t.tahun_akademik ?? t.tahun ?? t.nama ?? t.nama_tahun ?? `Tahun ${rawId}`;
          // Field status bisa bermacam nama di backend
          const rawStatus = t.status ?? t.status_tahun_akademik ?? t.status_ta ?? "arsip";
          return {
            id: Number(rawId),
            tahun_akademik: String(label),
            status: rawStatus as "aktif" | "arsip",
          };
        })
        .filter((t) => Boolean(t.id));

      setTahunOptions(list);

      const aktif = list.find((t) => t.status === "aktif");
      return aktif ? String(aktif.id) : list.length > 0 ? String(list[0].id) : "";
    } catch (err) {
      console.error("[TahunAkademik] error:", err);
      return "";
    }
  }, []);

  // ── Step 3: Ambil data periode (pembina/pelatih/siswa) per tahun ──
  // Backend show() mensyaratkan ekskul PUNYA anggota di tahun itu.
  // Kalau 404/422 berarti belum ada anggota → periodeData = null (kosong)
  const fetchPeriodeData = useCallback(
    async (tahunId: string) => {
      if (!id || !tahunId || tahunId === "undefined") {
        setPeriodeData(null);
        return;
      }
      setPeriodeLoading(true);
      try {
        const res = await api.get(`/spa/ekstrakurikuler/${id}`, {
          params: { tahun_akademik_id: Number(tahunId) },
        });
        const detail = res.data.data?.[0] ?? null;
        if (!detail) {
          setPeriodeData(null);
          return;
        }
        // Backend mengembalikan array periode, ambil yang match tahun
        const periode: PeriodeData | undefined = detail.periode?.find((p: any) => String(p.tahun_akademik_id) === tahunId);
        setPeriodeData(periode ?? null);
      } catch {
        // 404 / 422 = belum ada anggota di periode ini — itu normal
        setPeriodeData(null);
      } finally {
        setPeriodeLoading(false);
      }
    },
    [id],
  );

  // ── Fetch data select untuk modal ─────────────────────────────────
  const fetchSelectData = useCallback(async () => {
    if (selectLoaded) return;
    try {
      const [resPembina, resPelatih, resSiswa] = await Promise.all([api.get("/spa/data-select/pembina/ekstrakurikuler"), api.get("/spa/data-select/pelatih/ekstrakurikuler"), api.get("/spa/data-select/siswa/ekskul")]);
      if (resPembina.data.status === "success") setPembinaList(resPembina.data.data.pembina ?? []);
      if (resPelatih.data.status === "success") setPelatihList(resPelatih.data.data.pelatih ?? []);
      if (resSiswa.data.status === "success") setSiswaList(resSiswa.data.data.siswa ?? []);
      setSelectLoaded(true);
    } catch {
      // akan retry saat modal dibuka lagi
    }
  }, [selectLoaded]);

  // ── Init ──────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [base, defaultTahun] = await Promise.all([fetchEkskulBase(), fetchTahunAkademik()]);
      setEkskulBase(base);
      setSelectedTahun(defaultTahun);
      if (defaultTahun) await fetchPeriodeData(defaultTahun);
      setLoading(false);
    };
    init();
  }, []);

  // ── Refetch periode saat tahun berubah ───────────────────────────
  useEffect(() => {
    if (selectedTahun) fetchPeriodeData(selectedTahun);
  }, [selectedTahun]);

  // ── Tahun label helper ────────────────────────────────────────────
  const selectedTahunLabel = tahunOptions.find((t) => String(t.id) === selectedTahun);

  // ── Modal handlers ────────────────────────────────────────────────
  const openModal = async (m: ModalType) => {
    await fetchSelectData();
    setModal(m);
  };

  const closeModal = () => setModal(null);

  const handleSave = async (payload: Record<string, unknown>) => {
    if (!modal || !ekskulBase) return;
    setIsSaving(true);
    try {
      if (modal.kind === "tambah-pembina") {
        await api.post("/spa/pembina/ekstrakurikuler", {
          ...payload,
          ekstrakurikuler_id: ekskulBase.id,
        });
        Swal.fire({ icon: "success", title: "Pembina berhasil ditambahkan", timer: 1500, showConfirmButton: false });
      } else if (modal.kind === "edit-pembina") {
        await api.put(`/spa/pembina/ekstrakurikuler/${modal.pivot_id}`, payload);
        Swal.fire({ icon: "success", title: "Pembina berhasil diperbarui", timer: 1500, showConfirmButton: false });
      } else if (modal.kind === "tambah-pelatih") {
        await api.post("/spa/pelatih/ekstrakurikuler", {
          ...payload,
          ekstrakurikuler_id: ekskulBase.id,
        });
        Swal.fire({ icon: "success", title: "Pelatih berhasil ditambahkan", timer: 1500, showConfirmButton: false });
      } else if (modal.kind === "edit-pelatih") {
        await api.put(`/spa/pelatih/ekstrakurikuler/${modal.pivot_id}`, payload);
        Swal.fire({ icon: "success", title: "Pelatih berhasil diperbarui", timer: 1500, showConfirmButton: false });
      } else if (modal.kind === "tambah-siswa") {
        await api.post("/spa/siswa/ekskul", {
          ...payload,
          ekstrakurikuler_id: ekskulBase.id,
        });
        Swal.fire({ icon: "success", title: "Siswa berhasil didaftarkan", timer: 1500, showConfirmButton: false });
      } else if (modal.kind === "edit-siswa") {
        await api.put(`/spa/siswa/ekskul/${modal.pivot_id}`, payload);
        Swal.fire({ icon: "success", title: "Data siswa berhasil diperbarui", timer: 1500, showConfirmButton: false });
      }
      closeModal();
      await fetchPeriodeData(selectedTahun);
    } catch (err: any) {
      const errData = err.response?.data?.errors;
      const msg = (errData && (Object.values(errData).flat()[0] as string)) ?? err.response?.data?.message ?? "Terjadi kesalahan.";
      Swal.fire({ icon: "error", title: "Gagal!", text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete handlers ───────────────────────────────────────────────
  const confirmDelete = (title: string, text: string) =>
    Swal.fire({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#4F46E5",
    });

  const deletePembina = async (pivotId: number, nama: string) => {
    const c = await confirmDelete("Hapus Pembina?", `${nama} akan dihapus dari ekskul ini.`);
    if (!c.isConfirmed) return;
    try {
      await api.delete(`/spa/pembina/ekstrakurikuler/${pivotId}`);
      Swal.fire({ icon: "success", title: "Pembina berhasil dihapus", timer: 1200, showConfirmButton: false });
      await fetchPeriodeData(selectedTahun);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal!", text: err.response?.data?.message ?? "Terjadi kesalahan." });
    }
  };

  const deletePelatih = async (pivotId: number, nama: string) => {
    const c = await confirmDelete("Hapus Pelatih?", `${nama} akan dihapus dari ekskul ini.`);
    if (!c.isConfirmed) return;
    try {
      await api.delete(`/spa/pelatih/ekstrakurikuler/${pivotId}`);
      Swal.fire({ icon: "success", title: "Pelatih berhasil dihapus", timer: 1200, showConfirmButton: false });
      await fetchPeriodeData(selectedTahun);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal!", text: err.response?.data?.message ?? "Terjadi kesalahan." });
    }
  };

  const deleteSiswa = async (pivotId: number, nama: string) => {
    const c = await confirmDelete("Hapus Siswa?", `${nama} akan dikeluarkan dari ekskul ini.`);
    if (!c.isConfirmed) return;
    try {
      await api.delete(`/spa/siswa/ekskul/${pivotId}`);
      Swal.fire({ icon: "success", title: "Siswa berhasil dihapus", timer: 1200, showConfirmButton: false });
      await fetchPeriodeData(selectedTahun);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal!", text: err.response?.data?.message ?? "Terjadi kesalahan." });
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {modal && <InlineModal modal={modal} pembinaList={pembinaList} pelatihList={pelatihList} siswaList={siswaList} isSaving={isSaving} onClose={closeModal} onSave={handleSave} />}

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Detail Ekstrakurikuler" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors">
            <ChevronLeftIcon size={16} /> Kembali
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : !ekskulBase ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">Data ekstrakurikuler tidak ditemukan</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ── Info Card Ekskul ── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{ekskulBase.nama_ekskul}</h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={`text-xs capitalize ${statusEkskulBadge(ekskulBase.status)}`}>{ekskulBase.status}</Badge>
                      <Badge className={`text-xs ${statusAktifBadge(ekskulBase.status_aktif)}`}>{ekskulBase.status_aktif}</Badge>
                      <span className="text-sm text-gray-500 font-medium">Anggaran: {formatRupiah(ekskulBase.anggaran ?? 0)}</span>
                    </div>
                  </div>

                  {/* Pilih Tahun Akademik */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Tahun:</span>
                    <Select value={selectedTahun} onValueChange={setSelectedTahun}>
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Pilih Tahun" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Tahun Akademik</SelectLabel>
                          {tahunOptions.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.tahun_akademik} — {t.status}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* ── Label periode aktif ── */}
              {selectedTahunLabel && (
                <div className="flex items-center gap-2 text-sm text-gray-600 -mt-2">
                  <span>Periode:</span>
                  <span className="font-semibold">{selectedTahunLabel.tahun_akademik}</span>
                  <Badge className={`text-xs ${tahunStatusBadge(selectedTahunLabel.status)}`}>{selectedTahunLabel.status}</Badge>
                  {periodeLoading && <Loader2Icon className="animate-spin ml-1" size={14} />}
                </div>
              )}

              {/* ── Pesan kalau periode kosong ── */}
              {!periodeLoading && !periodeData && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">ℹ️ Belum ada pembina, pelatih, atau siswa pada periode ini. Gunakan tombol tambah di bawah untuk menambahkan.</div>
              )}

              {/* ────────── PEMBINA ────────── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2 font-semibold text-gray-700">
                    <UserIcon size={16} className="text-blue-500" />
                    Pembina
                  </div>
                  <Button size="sm" className="text-white" onClick={() => openModal({ kind: "tambah-pembina" })}>
                    <PlusIcon size={14} className="mr-1" /> Tambah Pembina
                  </Button>
                </div>

                <div className="p-4">
                  {periodeLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                      <Loader2Icon className="animate-spin" size={14} /> Memuat...
                    </div>
                  ) : periodeData?.anggota?.pembina?.pembina_id ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{periodeData.anggota.pembina.nama_pembina}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Tahun membina: {periodeData.anggota.pembina.tahun_membina ?? "—"}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            openModal({
                              kind: "edit-pembina",
                              pivot_id: periodeData.anggota.pembina.pembina_pivot_id!,
                              current_pembina_id: periodeData.anggota.pembina.pembina_id!,
                              nama_pembina: periodeData.anggota.pembina.nama_pembina!,
                            })
                          }
                        >
                          <PencilIcon size={13} />
                        </Button>
                        <Button size="sm" className="bg-muted-foreground hover:bg-muted-foreground/90" onClick={() => deletePembina(periodeData.anggota.pembina.pembina_pivot_id!, periodeData.anggota.pembina.nama_pembina!)}>
                          <Trash2Icon size={13} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic py-2">Belum ada pembina pada periode ini.</p>
                  )}
                </div>
              </div>

              {/* ────────── PELATIH ────────── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2 font-semibold text-gray-700">
                    <TrophyIcon size={16} className="text-amber-500" />
                    Pelatih
                  </div>
                  <Button size="sm" className="text-white" onClick={() => openModal({ kind: "tambah-pelatih" })}>
                    <PlusIcon size={14} className="mr-1" /> Tambah Pelatih
                  </Button>
                </div>

                <div className="p-4">
                  {periodeLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                      <Loader2Icon className="animate-spin" size={14} /> Memuat...
                    </div>
                  ) : periodeData?.anggota?.pelatih?.pelatih_id ? (
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{periodeData.anggota.pelatih.nama_pelatih}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Tahun melatih: {periodeData.anggota.pelatih.tahun_melatih ?? "—"}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            openModal({
                              kind: "edit-pelatih",
                              pivot_id: periodeData.anggota.pelatih.pelatih_pivot_id!,
                              current_pelatih_id: periodeData.anggota.pelatih.pelatih_id!,
                              nama_pelatih: periodeData.anggota.pelatih.nama_pelatih!,
                            })
                          }
                        >
                          <PencilIcon size={13} />
                        </Button>
                        <Button size="sm" className="bg-muted-foreground hover:bg-muted-foreground/90" onClick={() => deletePelatih(periodeData.anggota.pelatih.pelatih_pivot_id!, periodeData.anggota.pelatih.nama_pelatih!)}>
                          <Trash2Icon size={13} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic py-2">Belum ada pelatih pada periode ini.</p>
                  )}
                </div>
              </div>

              {/* ────────── SISWA ────────── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2 font-semibold text-gray-700">
                    <UsersIcon size={16} className="text-green-600" />
                    Daftar Siswa
                    {(periodeData?.anggota?.siswa?.length ?? 0) > 0 && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">{periodeData!.anggota.siswa.length} siswa</span>}
                  </div>
                  <Button size="sm" className="text-white" onClick={() => openModal({ kind: "tambah-siswa" })}>
                    <PlusIcon size={14} className="mr-1" /> Tambah Siswa
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  {periodeLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm p-4">
                      <Loader2Icon className="animate-spin" size={14} /> Memuat...
                    </div>
                  ) : (periodeData?.anggota?.siswa?.length ?? 0) > 0 ? (
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="w-10 text-center">No</TableHead>
                          <TableHead>Nama Siswa</TableHead>
                          <TableHead>NISN</TableHead>
                          <TableHead>NIS</TableHead>
                          <TableHead className="text-center">Sikap</TableHead>
                          <TableHead className="text-center">Status Kehadiran</TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {periodeData!.anggota.siswa.map((siswa, idx) => (
                          <TableRow key={siswa.siswa_pivot_id} className="hover:bg-gray-50 border-b border-gray-100">
                            <TableCell className="text-center text-sm">{idx + 1}</TableCell>
                            <TableCell className="font-medium text-sm">{siswa.nama_siswa}</TableCell>
                            <TableCell className="text-sm text-gray-500">{siswa.nisn}</TableCell>
                            <TableCell className="text-sm text-gray-500">{siswa.nis}</TableCell>
                            <TableCell className="text-center">{siswa.sikap ? <Badge className={`text-xs ${sikapBadge(siswa.sikap)}`}>{siswa.sikap}</Badge> : <span className="text-xs text-gray-400">—</span>}</TableCell>
                            <TableCell className="text-center">{siswa.status ? <Badge className={`text-xs ${statusSiswaBadge(siswa.status)}`}>{siswa.status}</Badge> : <span className="text-xs text-gray-400">—</span>}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex gap-1 justify-center">
                                <Button
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={() =>
                                    openModal({
                                      kind: "edit-siswa",
                                      pivot_id: siswa.siswa_pivot_id,
                                      siswa_id: siswa.siswa_id,
                                      nama_siswa: siswa.nama_siswa,
                                      sikap: siswa.sikap,
                                      status: siswa.status,
                                    })
                                  }
                                >
                                  <PencilIcon size={12} />
                                </Button>
                                <Button size="sm" className="bg-muted-foreground hover:bg-muted-foreground/90 h-7 px-2" onClick={() => deleteSiswa(siswa.siswa_pivot_id, siswa.nama_siswa)}>
                                  <Trash2Icon size={12} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-gray-400 italic p-4">Belum ada siswa yang terdaftar pada periode ini.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DetailEkstrakurikuler;
