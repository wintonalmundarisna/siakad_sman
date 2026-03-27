<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DataBerkas;
use App\Models\TahunAkademik;
use App\Models\Semester;
use App\Helpers\ApiResponse;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\BerkasAdministrasiExport;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class DataBerkasController extends Controller
{
    /**
     * ✅ SPA/TU
     */
    public function index(Request $request)
    {
        $dataBerkas = DataBerkas::with(['tahunAkademik', 'semester'])
        ->where('tahun_akademik_id', $request->tahun_akademik_id)
        ->get();

        if ($dataBerkas->isEmpty()) {
            return ApiResponse::error('Tidak ada data berkas pada tahun ini');
        }

        $formatted = $dataBerkas->groupBy('tahun_akademik_id')
        ->map(function ($dBerkas) {
            $tahun = $dBerkas->first()->tahunAkademik;

            return [
                'tahun_akademik_id'      => $tahun->id,
                'tahun_akademik'         => $tahun->tahun_akademik,
                'status_tahun_akademik'  => $tahun->status,
                'semester'  => $dBerkas->groupBy('semester_id')
                ->map(function ($berkas) {
                    $semester = $berkas->first()->semester;

                    return [
                        'semester_id'       => $semester->id,
                        'semester'          => $semester->semester,
                        'status_semester'   => $semester->status,
                        'berkas'            => $berkas->map(function ($b) {
                            return [
                                'berkas_id'     => $b->id,
                                'nama_berkas'   => $b->nama_berkas,
                                'berkas' => $b->berkas ? route('berkas.administrasi.view', [
                                    'filename' => basename($b->berkas),
                                ]) : null,
                                'hari'          => Carbon::parse($b->hari)->translatedFormat('l, d F Y') ?? null,
                            ];
                        })->values(),
                    ];
                })->values(),
            ];
        })->values();

        return ApiResponse::success(
            $formatted,
            'Data berkas '.$formatted->first()['tahun_akademik'].' berhasil diambil'
        );
        
    }

    // ✅
    private function simpanBerkas($file, $folder, $nama_berkas)
    {
        $extension = $file->getClientOriginalExtension();
        $uuid = substr(Str::uuid(), 0, 3);
        // $namaBerkasSlug = Str::slug($nama_berkas, '-');

        $disk = 'private';
        $subfolder = 'berkas_administrasi';
        $namaFile = "{$uuid}-berkas-administrasi.{$extension}";

        // Simpan file di dalam subfolder
        $path = $file->storeAs($subfolder, $namaFile, $disk);

        // Simpan path lengkap dengan prefix disk di database
        return "{$disk}/{$path}";
    }

    // ✅
    public function tampilkanBerkas($filename)
    {
        $privatePath = storage_path("app/private/berkas_administrasi/{$filename}");

        if (!file_exists($privatePath)) {
            abort(404);
        }

        $extension = strtolower(pathinfo($privatePath, PATHINFO_EXTENSION));

        $mimeTypes = [
            'pdf'  => 'application/pdf',
            'xls'  => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'doc'  => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png'  => 'image/png',
            'gif'  => 'image/gif',
            'bmp'  => 'image/bmp',
            'webp' => 'image/webp',
        ];

        $mimeType = $mimeTypes[$extension] ?? mime_content_type($privatePath);

        return response()->file($privatePath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . basename($privatePath) . '"'
        ]);
    }


    /**
     * ✅ SPA/TU
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_berkas' => 'required|string',
                'berkas' => 'required',
            ], [
                'nama_berkas.required' => 'Nama berkas wajib diisi',
                'berkas.required' => 'Berkas wajib diisi',
            ]);           

            Carbon::setLocale('id');

            $tahun = TahunAkademik::where('status', 'aktif')->first();
            $semester = Semester::where('status', 'aktif')->first();

            $unik = DataBerkas::where('nama_berkas', $validated['nama_berkas'])
            ->where('tahun_akademik_id', $tahun->id)
            ->where('semester_id', $semester->id)
            ->first();

            if ($unik) {
                return ApiResponse::error('Berkas serupa sudah ada');
            }

            // handle berkas
            // Sengaja namanya gapake nama_berkas karna terlalu panjang nanti
            if ($request->hasFile('berkas')) {
                $validated['berkas'] = $this->simpanBerkas(
                    $request->file('berkas'),
                    'berkas_administrasi', // folder penyimpanan
                    $request->nama_berkas
                );
            }

            $berkas = DataBerkas::create([
                'nama_berkas' => $validated['nama_berkas'],
                'berkas' => $validated['berkas'],
                'hari' => Carbon::today()->toDateString(),            
                'tahun_akademik_id' => $tahun->id ?? null,
                'semester_id' => $semester->id ?? null,
            ]);

            $berkas->load(['tahunAkademik', 'semester']);
            
            return ApiResponse::success([
                'id' => $berkas->id,
                'nama_berkas' => $berkas->nama_berkas,                
                'berkas' => $berkas->berkas ? route('berkas.administrasi.view', [
                    'filename' => basename($berkas->berkas),
                ]) : null,
                'hari' => Carbon::parse($berkas->hari)->translatedFormat('l, d F Y') ?? null,   // Senin, 24 September 2026            
                'tahun_akademik' => $berkas->tahunAkademik->tahun_akademik,
                'semester' => $berkas->semester->semester,
            ], 'Data berkas berhasil dibuat');
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * TU/SPA
     */
    public function update(Request $request, string $id)
    {
        $berkas = DataBerkas::find($id);

        if (!$berkas) {
            return ApiResponse::error('Berkas tidak ditemukan');
        }

        $validated = $request->validate([
            'nama_berkas'   => 'sometimes',
            'berkas'        => 'sometimes'
        ]);         

        Carbon::setLocale('id');

        $tahun = TahunAkademik::where('status', 'aktif')->first();
        $semester = Semester::where('status', 'aktif')->first();

        $unik = DataBerkas::where('nama_berkas', $validated['nama_berkas'])
        ->where('tahun_akademik_id', $tahun->id)
        ->where('semester_id', $semester->id)
        ->where('id', '!=', $berkas->id)
        ->first();

        if ($unik) {
            return ApiResponse::error('Berkas serupa sudah ada');
        }

        // Handle upload berkas
        if ($request->hasFile('berkas')) {

            $oldPath = $berkas->berkas;

            $validated['berkas'] = $this->simpanBerkas(
                $request->file('berkas'),
                'berkas_administrasi', // folder
                $request->nama_berkas
            );

            if ($oldPath) {
                try {
                    $relativePath = str_replace('private/', '', $oldPath);

                    if (Storage::disk('private')->exists($relativePath)) {
                        Storage::disk('private')->delete($relativePath);
                    }
                } catch (\Exception $e) {
                    \Log::warning("Gagal hapus berkas lama: {$oldPath}", [
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        // Update data ke database
        $berkas->update([
            'nama_berkas'       => $validated['nama_berkas'],
            'berkas'            => $validated['berkas'],
            'hari'              => Carbon::today()->toDateString(),            
            'tahun_akademik_id' => $tahun->id ?? null,
            'semester_id'       => $semester->id ?? null,
        ]);

        $berkas->load(['tahunAkademik', 'semester']);

        return ApiResponse::success([
            'id' => $berkas->id,
            'nama_berkas' => $berkas->nama_berkas,                
            'berkas' => $berkas->berkas ? route('berkas.administrasi.view', [
                'filename' => basename($berkas->berkas),
                ]) : null,
            'hari' => Carbon::parse($berkas->hari)->translatedFormat('l, d F Y') ?? null,   // Senin, 24 September 2026            
            'tahun_akademik' => $berkas->tahunAkademik->tahun_akademik,
            'semester' => $berkas->semester->semester,
        ], 'Data berkas berhasil diperbarui');
    }

    /**
     * TU/SPA
     */
    public function destroy(string $id)
    {
        $berkas = DataBerkas::find($id);

        if (!$berkas) {
            return ApiResponse::error('Data berkas tidak ditemukan');
        }

        // Nilai contoh: "private/berkas_administrasi/31e-berkas-administrasi.jpg"
        $storedPath = $berkas->berkas;

        // Normalisasi ke path relatif disk 'private' → "berkas_administrasi/31e-berkas-administrasi.jpg"
        $relativePath = ltrim(Str::of($storedPath)->replaceFirst('private/', ''), '/');

        // Hapus file bila ada
        if ($relativePath && Storage::disk('private')->exists($relativePath)) {
            Storage::disk('private')->delete($relativePath);
        }

        // Hapus record
        $berkas->delete();

        return ApiResponse::success(null, 'Data berkas berhasil dihapus');
    }


    // TU/SPA
    public function exportExcel(Request $request)
    {       

        $tahun_id = $request->input('tahun_akademik_id');
        // $semester_id = $request->input('semester_id');

        $tahunAkademik = TahunAkademik::find($tahun_id);
        $tahun = str_replace(['/','\\',' '], '_', $tahunAkademik->tahun_akademik);

        if (!$tahunAkademik) {
            return ApiResponse::error('Tahun akademik tidak ditemukan');
        }

        // $semester = Semester::find($semester_id);

        // if (!$semester) {
        //     return ApiResponse::error('Semester tidak ditemukan');
        // }

        return Excel::download(
            new BerkasAdministrasiExport($tahun_id),
            'Berkas_Administrasi_'.$tahun.'.xlsx'
        );
    }   

    public function exportBerkasZip(Request $request)
    {
        // mengambil tahun akademik id dari request
        $tahunId = $request->tahun_akademik_id;

        // mencari data tahun akademik berdasarkan id
        $tahunAkademik = TahunAkademik::find($tahunId);

        // jika tahun akademik tidak ditemukan maka kirim error
        if (!$tahunAkademik) {
            return ApiResponse::error('Tahun akademik tidak ditemukan');
        }

        // mengambil semua data berkas beserta relasi semester
        $dataBerkas = DataBerkas::with('semester')
            ->where('tahun_akademik_id', $tahunId)
            ->get();

        // jika tidak ada berkas pada tahun akademik tersebut
        if ($dataBerkas->isEmpty()) {
            return ApiResponse::error('Tidak ada berkas pada tahun akademik ini');
        }

        // membersihkan nama tahun akademik agar aman dijadikan nama file
        $tahun = str_replace(['/','\\',' '], '_', $tahunAkademik->tahun_akademik);

        // menentukan nama file zip
        $zipFileName = 'Berkas_Administrasi_' . $tahun . '.zip';

        // membuat file zip sementara di folder temp server
        $tempZipPath = tempnam(sys_get_temp_dir(), 'zip_berkas_administrasi_');

        // membuat instance class ZipArchive
        $zip = new \ZipArchive;

        // membuka file zip untuk dibuat
        if ($zip->open($tempZipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json([
                'error' => 'Tidak dapat membuat file ZIP'
            ], 500);
        }

        // looping semua data berkas
        foreach ($dataBerkas as $berkas) {

            // mengambil path file dari database
            $relativePath = $berkas->berkas;

            // jika path file kosong maka skip
            if (!$relativePath) {
                continue;
            }

            // contoh path:
            // private/berkas_administrasi/521-berkas-administrasi.pdf

            // memisahkan disk dan path file
            $parts = explode('/', $relativePath, 2);

            // jika format path tidak valid maka skip
            if (count($parts) < 2) {
                continue;
            }

            // menentukan disk storage (public / private)
            $disk = $parts[0];

            // path file di dalam disk storage
            $pathInDisk = $parts[1];

            // hanya izinkan disk public dan private
            if (!in_array($disk, ['public', 'private'])) {
                continue;
            }

            // cek apakah file benar-benar ada di storage
            if (!Storage::disk($disk)->exists($pathInDisk)) {
                continue;
            }

            // mendapatkan path absolut file di server
            $fullPath = Storage::disk($disk)->path($pathInDisk);

            // mengambil nama file saja
            $filename = basename($relativePath);

            // menentukan nama folder semester di dalam zip
            $semesterFolder = 'Semester_' . ($berkas->semester->semester ?? 'Tanpa_Semester');

            // menentukan path file di dalam zip
            $pathInZip = $semesterFolder . '/' . $filename;

            // menambahkan file ke dalam zip sesuai folder semester
            $zip->addFile($fullPath, $pathInZip);
        }

        // menutup file zip setelah semua file dimasukkan
        $zip->close();

        // memastikan file zip berhasil dibuat
        if (!file_exists($tempZipPath)) {
            return response()->json([
                'error'     => 'Gagal membuat file ZIP',
                'message'   => 'Berkas tidak ditemukan'
            ], 500);
        }

        // mengirim file zip ke user untuk didownload
        return response()->download($tempZipPath, $zipFileName, [
            'Content-Type' => 'application/zip',
        ])
        // setelah download selesai file zip otomatis dihapus
        ->deleteFileAfterSend(true);
    }
}
