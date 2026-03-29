import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftIcon, Loader2Icon, PenBoxIcon,
  ArrowUpRight, ArrowDownRight, Wallet,
  BookOpenIcon, CalendarIcon,
} from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import { keuanganService } from "@/services/keuanganService";
import type { Keuangan } from "@/types/keuanganSekolah";

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatRupiah = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(isNaN(num) ? 0 : num);
};

// ── Component ──────────────────────────────────────────────────────────────────
const DetailKeuangan = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Keuangan | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await keuanganService.getDetail(Number(id));
        if (response.status === "success") setData(response.data);
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat detail data keuangan.",
        });
        navigate("/superadmin/informasi-laporan-umum/data-keuangan");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const saldo = data ? parseFloat(data.debit) - parseFloat(data.kredit) : 0;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`w-full min-h-screen bg-gray-50 transition-all duration-300 ${
          isCollapsed ? "md:ml-16" : "md:ml-[300px]"
        }`}
      >
        <PageTitle title="Detail Data Keuangan" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8 space-y-6">

          {/* ── Header ── */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/superadmin/informasi-laporan-umum/data-keuangan")}
            >
              <ArrowLeftIcon size={16} /> Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detail Data Keuangan</h1>
              <p className="text-sm text-gray-500 mt-0.5">Informasi lengkap transaksi keuangan</p>
            </div>
          </div>

          {/* ── Loading ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="font-medium">Memuat detail...</p>
            </div>
          ) : !data ? null : (
            <>
              {/* ── Summary Cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Debit */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">Debit</span>
                    <span className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                      <ArrowUpRight size={18} className="text-green-600" />
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatRupiah(data.debit)}</p>
                  <p className="text-xs text-green-600 font-medium mt-1.5">Pemasukan</p>
                </div>

                {/* Kredit */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">Kredit</span>
                    <span className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                      <ArrowDownRight size={18} className="text-red-500" />
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatRupiah(data.kredit)}</p>
                  <p className="text-xs text-red-500 font-medium mt-1.5">Pengeluaran</p>
                </div>

                {/* Saldo */}
                <div
                  className={`rounded-xl border shadow-sm p-5 ${
                    saldo >= 0 ? "bg-primary border-primary/20" : "bg-red-600 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/80">Saldo Bersih</span>
                    <span className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                      <Wallet size={18} className="text-white" />
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatRupiah(saldo)}</p>
                  <p className="text-xs text-white/70 mt-1.5">Debit − Kredit</p>
                </div>
              </div>

              {/* ── Detail Card ── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpenIcon size={17} className="text-primary" />
                    <h2 className="font-semibold text-gray-800">Informasi Transaksi</h2>
                  </div>
                  <Button
                    size="sm"
                    className="bg-primary"
                    onClick={() =>
                      navigate(
                        `/superadmin/informasi-laporan-umum/data-keuangan/edit/${data.id}`
                      )
                    }
                  >
                    <PenBoxIcon size={14} className="mr-1.5" /> Edit
                  </Button>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-0">
                  {(
                    [
                      {
                        label: "ID Transaksi",
                        value: (
                          <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">
                            #{data.id}
                          </span>
                        ),
                      },
                      {
                        label: "Nama Akun",
                        value: (
                          <span className="font-semibold text-gray-900">{data.nama_akun}</span>
                        ),
                      },
                      // ── Tahun Akademik ──────────────────────────────────────
                      data.tahun_akademik
                        ? {
                            label: "Tahun Akademik",
                            value: (
                              <div className="flex items-center justify-end gap-2">
                                <CalendarIcon size={14} className="text-gray-400" />
                                <span className="text-gray-800">{data.tahun_akademik}</span>
                                {data.status_tahun_akademik && (
                                  <Badge
                                    className={`text-xs ${
                                      data.status_tahun_akademik === "aktif"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {data.status_tahun_akademik}
                                  </Badge>
                                )}
                              </div>
                            ),
                          }
                        : null,
                      // ────────────────────────────────────────────────────────
                      {
                        label: "Debit",
                        value: (
                          <span className="font-semibold text-green-600">
                            {formatRupiah(data.debit)}
                          </span>
                        ),
                      },
                      {
                        label: "Kredit",
                        value: (
                          <span className="font-semibold text-red-500">
                            {formatRupiah(data.kredit)}
                          </span>
                        ),
                      },
                      {
                        label: "Keterangan",
                        value: data.keterangan ? (
                          <span className="text-gray-700 whitespace-pre-wrap">
                            {data.keterangan}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        ),
                      },
                    ] as Array<{ label: string; value: React.ReactNode } | null>
                  )
                    .filter(Boolean)
                    .map((row, i, arr) => (
                      <div
                        key={i}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between py-3.5 ${
                          i < arr.length - 1 ? "border-b border-gray-100" : ""
                        }`}
                      >
                        <span className="text-sm text-gray-500 font-medium mb-1 sm:mb-0 sm:w-40 shrink-0">
                          {row!.label}
                        </span>
                        <span className="text-sm flex-1 sm:text-right">{row!.value}</span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DetailKeuangan;