import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Footer from "@/pages/Footer";
import { ArrowLeftIcon, KeyRound, Loader2Icon, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/api/axios";
import Swal from "sweetalert2";

interface FormData {
  email: string;
  password_lama: string;
  password_baru: string;
  konfirmasi_password: string;
}

interface FormErrors {
  email?: string[];
  password_lama?: string[];
  password_baru?: string[];
  konfirmasi_password?: string[];
}

const UbahPasswordSiswa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [namaSiswa, setNamaSiswa] = useState("");
  const [loadingSiswa, setLoadingSiswa] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password_lama: "",
    password_baru: "",
    konfirmasi_password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [showLama, setShowLama] = useState(false);
  const [showBaru, setShowBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);

  // ── Fetch email dari detail siswa ────────────────────────────────────────
  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        setLoadingSiswa(true);
        const res = await api.get(`/spa/siswa/${id}`);
        if (res.data.status === "success") {
          const d = res.data.data;
          setNamaSiswa(d.nama ?? "");
          setFormData((prev) => ({ ...prev, email: d.email ?? "" }));
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: err.response?.data?.message || "Tidak dapat memuat data siswa.",
        });
        navigate("/superadmin/informasi-sekolah/siswa");
      } finally {
        setLoadingSiswa(false);
      }
    };

    if (id) fetchSiswa();
  }, [id]);

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const res = await api.post("/spa/ubah-password/siswa", {
        email: formData.email,
        password_lama: formData.password_lama,
        password_baru: formData.password_baru,
        konfirmasi_password: formData.konfirmasi_password,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Password siswa berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-sekolah/siswa");
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: err.response?.data?.message || "Terjadi kesalahan.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300 ${
          isCollapsed ? "md:ml-16" : "md:ml-[300px]"
        }`}
      >
        <PageTitle title="Ubah Password Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/superadmin/informasi-sekolah/siswa">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ArrowLeftIcon size={16} />
                Kembali
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Ubah Password Siswa</h1>
          </div>

          {loadingSiswa ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <KeyRound className="w-5 h-5 text-primary" />
                    Ubah Password — {namaSiswa}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Email (readonly) */}
                    <div>
                      <label className="block text-sm font-semibold mb-1">Email Siswa</label>
                      <input
                        type="email"
                        value={formData.email}
                        readOnly
                        className="border p-2 w-full rounded bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                    </div>

                    {/* Password Lama */}
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Password Lama <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showLama ? "text" : "password"}
                          placeholder="Masukkan password lama"
                          value={formData.password_lama}
                          onChange={(e) => setFormData({ ...formData, password_lama: e.target.value })}
                          className="border p-2 w-full rounded pr-10 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLama(!showLama)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showLama ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password_lama && <p className="text-red-500 text-xs mt-1">{errors.password_lama[0]}</p>}
                    </div>

                    {/* Password Baru */}
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Password Baru <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showBaru ? "text" : "password"}
                          placeholder="Min. 5 karakter, huruf besar, angka, simbol"
                          value={formData.password_baru}
                          onChange={(e) => setFormData({ ...formData, password_baru: e.target.value })}
                          className="border p-2 w-full rounded pr-10 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowBaru(!showBaru)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showBaru ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password_baru && <p className="text-red-500 text-xs mt-1">{errors.password_baru[0]}</p>}
                      <p className="text-xs text-gray-400 mt-1">Harus mengandung huruf besar, huruf kecil, angka, dan simbol.</p>
                    </div>

                    {/* Konfirmasi */}
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Konfirmasi Password Baru <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showKonfirmasi ? "text" : "password"}
                          placeholder="Ulangi password baru"
                          value={formData.konfirmasi_password}
                          onChange={(e) => setFormData({ ...formData, konfirmasi_password: e.target.value })}
                          className="border p-2 w-full rounded pr-10 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKonfirmasi(!showKonfirmasi)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showKonfirmasi ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.konfirmasi_password && <p className="text-red-500 text-xs mt-1">{errors.konfirmasi_password[0]}</p>}
                    </div>

                    {/* Tombol */}
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={submitting} className="bg-primary">
                        {submitting ? (
                          <><Loader2Icon className="animate-spin mr-2" size={16} />Menyimpan...</>
                        ) : (
                          <><KeyRound size={16} className="mr-2" />Simpan Password</>
                        )}
                      </Button>
                      <Link to="/superadmin/informasi-sekolah/siswa">
                        <Button type="button" className="bg-muted-foreground hover:bg-muted-foreground/90">
                          Batal
                        </Button>
                      </Link>
                    </div>

                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default UbahPasswordSiswa;