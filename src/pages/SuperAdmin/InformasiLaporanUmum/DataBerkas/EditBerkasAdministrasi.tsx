import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2Icon, ArrowLeftIcon, SaveIcon, UploadIcon, FileIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import api from "@/api/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  nama_berkas: string;
  berkas: File | null;
}

interface FormErrors {
  nama_berkas?: string;
}

// Data yang dikirim dari index.tsx via navigate state
interface LocationState {
  berkas_id: number;
  nama_berkas: string;
  berkas: string | null;
  hari: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const EditBerkasAdministrasi = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✅ Ambil data dari navigate state (dikirim dari index.tsx)
  const stateData = location.state as LocationState | null;

  const [form, setForm] = useState<FormState>({
    nama_berkas: stateData?.nama_berkas ?? "",
    berkas: null,
  });
  const [currentBerkasUrl,] = useState<string | null>(stateData?.berkas ?? null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  // ✅ Jika tidak ada state (user akses URL langsung), redirect ke list
  useEffect(() => {
    if (!stateData) {
      Swal.fire({
        icon: "warning",
        title: "Akses tidak valid",
        text: "Silakan buka halaman edit melalui tombol Edit pada daftar berkas.",
      }).then(() => navigate("/superadmin/informasi-laporan-umum/berkas-administrasi"));
    }
  }, []);

  // ── Validasi ──
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.nama_berkas.trim()) newErrors.nama_berkas = "Nama berkas wajib diisi.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, berkas: file }));
    setFileName(file?.name ?? "");
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("nama_berkas", form.nama_berkas);
    formData.append("_method", "PUT"); // ✅ Laravel method spoofing untuk multipart/form-data
    if (form.berkas) formData.append("berkas", form.berkas);

    setLoading(true);
    try {
      await api.post(`/spa/berkas-administrasi/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Berkas administrasi berhasil diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/superadmin/informasi-laporan-umum/berkas-administrasi");
    } catch (err: any) {
      const errData = err.response?.data;
      const msg =
        errData?.message ||
        (errData?.errors ? Object.values(errData.errors).flat()[0] : null) ||
        "Gagal memperbarui berkas.";
      Swal.fire({ icon: "error", title: "Gagal", text: msg as string });
    } finally {
      setLoading(false);
    }
  };

  // Jika state null, render kosong sementara Swal muncul
  if (!stateData) return null;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-gray-50 transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Berkas Administrasi" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8 space-y-6">
          {/* ── Page Header ── */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeftIcon size={16} />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Berkas Administrasi</h1>
              <p className="text-sm text-gray-500 mt-0.5">Perbarui data berkas administrasi</p>
            </div>
          </div>

          {/* ── Form Card ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 w-full">
            {/* Info berkas lama */}
            {currentBerkasUrl && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 text-sm text-blue-700">
                <FileIcon size={15} className="shrink-0" />
                <span>
                  File saat ini:{" "}
                  <a href={currentBerkasUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 hover:text-blue-900">
                    Lihat file
                  </a>{" "}
                  — kosongkan field upload jika tidak ingin mengganti file.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Nama Berkas */}
              <div className="space-y-1.5">
                <Label htmlFor="nama_berkas" className="font-semibold text-gray-700">
                  Nama Berkas <span className="text-red-500">*</span>
                </Label>
                <Input id="nama_berkas" name="nama_berkas" placeholder="Contoh: SK Panitia Ujian" value={form.nama_berkas} onChange={handleChange} className={errors.nama_berkas ? "border-red-400 focus-visible:ring-red-300" : ""} />
                {errors.nama_berkas && <p className="text-xs text-red-500 mt-1">{errors.nama_berkas}</p>}
              </div>

              {/* Upload File (opsional saat edit) */}
              <div className="space-y-1.5">
                <Label htmlFor="berkas" className="font-semibold text-gray-700">
                  Ganti File Berkas <span className="text-gray-400 font-normal text-xs">(opsional)</span>
                </Label>

                <label htmlFor="berkas" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center gap-1 text-gray-500">
                    <UploadIcon size={20} />
                    {fileName ? (
                      <span className="text-sm font-medium text-primary">{fileName}</span>
                    ) : (
                      <>
                        <span className="text-sm font-medium">Klik untuk pilih file baru</span>
                        <span className="text-xs text-gray-400">PDF, Word, Excel, JPG, PNG</span>
                      </>
                    )}
                  </div>
                  <input id="berkas" type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={handleFileChange} />
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="bg-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2Icon size={15} className="mr-1.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <SaveIcon size={15} className="mr-1.5" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
                  Batal
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

export default EditBerkasAdministrasi;