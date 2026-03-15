/**
 * EditTahunAkademik
 * Route: /superadmin/informasi-sekolah/tahun-akademik/edit/:id
 *
 * CATATAN: GET /spa/tahun-akademik/:id di-comment di backend → tidak tersedia.
 * Prefill dilakukan dari GET /spa/tahun-akademik (list) lalu cari by id.
 */
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { ArrowLeft, CircleXIcon, FilePenLine, Loader2Icon } from "lucide-react";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";

interface FormErrors {
  tahun_akademik?: string[];
  keterangan?: string[];
  status?: string[];
}

const EditTahunAkademik = () => {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [initialStatus, setInitialStatus] = useState("");
  const [errors, setErrors]           = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    tahun_akademik: "",
    keterangan: "",
    status: "aktif",
  });

  const backUrl = "/superadmin/informasi-sekolah/tahun-akademik";

  // ── Fetch dari list (bukan detail yang di-comment) ────────────────────────────
  useEffect(() => {
    if (!id) { navigate(backUrl); return; }

    api.get("/spa/tahun-akademik")
      .then((res) => {
        if (res.data.status === "success") {
          const found = res.data.data.find(
            (d: any) => d.tahun_akademik_id === Number(id)
          );
          if (found) {
            setFormData({
              tahun_akademik: found.tahun_akademik || "",
              keterangan:     found.keterangan      || "",
              status:         found.status_tahun_akademik || "aktif",
            });
            setInitialStatus(found.status_tahun_akademik || "aktif");
          } else {
            Swal.fire({ icon: "error", title: "Data tidak ditemukan!" });
            navigate(backUrl);
          }
        }
      })
      .catch(() => {
        Swal.fire({ icon: "error", title: "Gagal memuat data!" });
        navigate(backUrl);
      })
      .finally(() => setLoadingPage(false));
  }, [id]);

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await api.put(`/spa/tahun-akademik/${id}`, formData);
      if (res.data.status === "success") {
        await Swal.fire({
          icon: "success", title: "Berhasil!",
          text: "Data tahun akademik berhasil diperbarui.",
          showConfirmButton: false, timer: 1800,
        });
        navigate(backUrl);
      }
    } catch (err: any) {
      const httpStatus = err.response?.status;
      const errData    = err.response?.data;

      if (httpStatus === 422 && errData?.errors) {
        if (errData.errors.status) {
          Swal.fire({
            icon: "warning", title: "Tidak dapat mengubah status!",
            text: Array.isArray(errData.errors.status)
              ? errData.errors.status[0]
              : errData.errors.status,
          });
        } else {
          setErrors(errData.errors);
        }
      } else {
        Swal.fire({
          icon: "error", title: "Koneksi gagal!",
          text: errData?.message || "Tidak dapat terhubung ke server.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loadingPage) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <PageTitle title="Edit Tahun Akademik" />
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2Icon className="animate-spin mb-3" size={32} />
            <p className="font-medium">Memuat data...</p>
          </div>
          <Footer />
        </main>
      </SidebarProvider>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Tahun Akademik" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-3xl font-bold">Edit Tahun Akademik</h1>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <form className="space-y-5 max-w-lg w-full" onSubmit={handleSubmit}>

              {/* Tahun Akademik */}
              <div>
                <label className="block font-semibold mb-1">
                  Tahun Akademik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="cth: 2025/2026"
                  value={formData.tahun_akademik}
                  onChange={(e) => {
                    setFormData({ ...formData, tahun_akademik: e.target.value });
                    setErrors({ ...errors, tahun_akademik: undefined });
                  }}
                  className={`border rounded w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.tahun_akademik ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.tahun_akademik && (
                  <p className="text-red-500 text-sm mt-1">{errors.tahun_akademik[0]}</p>
                )}
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-semibold mb-1">Keterangan</label>
                <textarea
                  rows={3}
                  placeholder="Keterangan (opsional)..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="border border-gray-300 rounded w-full p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block font-semibold mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => {
                    setFormData({ ...formData, status: v });
                    setErrors({ ...errors, status: undefined });
                  }}
                  disabled={initialStatus === "arsip"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- pilih status --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Status</SelectLabel>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="arsip">Arsip</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>
                )}
              </div>

              {/* Info & Peringatan */}
              {initialStatus === "arsip" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                  <p>Tahun akademik yang sudah diarsipkan tidak dapat diubah statusnya kembali ke aktif.</p>
                </div>
              )}

              {formData.status === "arsip" && initialStatus === "aktif" && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                  <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Pastikan tidak ada semester yang masih aktif pada tahun ini</li>
                    <li>Setelah diarsipkan, status tidak dapat dikembalikan ke aktif</li>
                  </ul>
                </div>
              )}

              {/* Tombol */}
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={loading} className="bg-primary gap-2">
                  <FilePenLine size={16} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                <Button
                  type="button" className="gap-2 bg-muted-foreground hover:bg-muted-foreground/90"
                  onClick={() => navigate(backUrl)}
                >
                  <CircleXIcon size={16} /> Batal
                </Button>
              </div>
            </form>
          </div>
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditTahunAkademik;