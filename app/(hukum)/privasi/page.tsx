import type { Metadata } from "next";
import { Daftar, KerangkaHukum, Pasal } from "@/components/hukum";

export const metadata: Metadata = { title: "Kebijakan Privasi" };

export default function Privasi() {
  return (
    <KerangkaHukum judul="Kebijakan Privasi">
      <p>Kebijakan ini menjelaskan data apa yang dikumpulkan lewat aplikasi Yuk Masuk!, untuk apa, dan bagaimana dijaga. Data anak adalah data pribadi, dan kami memperlakukannya dengan hati-hati.</p>

      <Pasal no={1} judul="Siapa yang mengelola data">
        <Daftar butir={[
          <><b>Sekolah</b> yang Anda daftari menentukan data apa yang diminta dan memakainya untuk proses SPMB. Sekolah adalah pihak yang berhubungan langsung dengan Anda tentang data anak.</>,
          <><b>Penyedia aplikasi</b> <mark>[DIISI: nama penyedia]</mark> menyediakan sistem dan memproses data atas nama sekolah.</>,
        ]} />
      </Pasal>

      <Pasal no={2} judul="Data yang kami kumpulkan">
        <p><b>Dari orang tua (tanpa akun):</b></p>
        <Daftar butir={[
          "Nama lengkap dan tanggal lahir anak, jalur yang dipilih, serta isian tambahan yang diminta sekolah.",
          "Nomor WhatsApp orang tua, untuk dihubungi admin sekolah.",
          "Berkas pendukung yang diunggah (misalnya kartu keluarga, akta kelahiran) sesuai syarat sekolah.",
          "Waktu persetujuan privasi, nomor pendaftaran, dan status pendaftaran beserta catatan sekolah.",
          "Sidik perangkat berupa hash dari alamat IP dan jenis browser, hanya untuk membatasi spam. Alamat IP mentah tidak disimpan di data pendaftaran.",
        ]} />
        <p><b>Dari admin sekolah:</b> email, kata sandi (disimpan terenkripsi oleh penyedia autentikasi), data profil sekolah, dan catatan aktivitas langganan.</p>
        <p>Kami tidak memakai pelacak iklan. Kami hanya menghitung kunjungan halaman secara anonim (Vercel Analytics, tanpa cookie) untuk memperbaiki aplikasi.</p>
      </Pasal>

      <Pasal no={3} judul="Untuk apa data dipakai">
        <Daftar butir={[
          "Memproses pendaftaran: admin sekolah memeriksa data dan berkas, menetapkan status, dan menghubungi orang tua.",
          "Menampilkan status pendaftaran kepada Anda lewat nomor pendaftaran dan tanggal lahir anak.",
          "Menjaga keamanan dan mencegah penyalahgunaan, misalnya pendaftaran massal otomatis.",
          "Operasional langganan: kode aktivasi dan pengingat dikirim ke email admin sekolah.",
        ]} />
        <p>Data tidak dijual dan tidak dipakai untuk iklan.</p>
      </Pasal>

      <Pasal no={4} judul="Siapa yang dapat mengakses">
        <Daftar butir={[
          "Admin sekolah yang Anda daftari, hanya untuk data sekolahnya sendiri. Sekolah lain tidak dapat melihatnya.",
          "Penyedia aplikasi, terbatas untuk pemeliharaan, keamanan, dan menangani permintaan dukungan.",
          "Penyedia infrastruktur yang kami pakai untuk menyimpan dan menjalankan sistem (basis data, penyimpanan berkas, hosting, dan pengiriman email) sebagai pemroses data. Penyedia ini dapat berada di luar Indonesia: lokasi saat ini <mark>[DIISI: wilayah server]</mark>.",
          "Pihak berwenang bila diwajibkan oleh hukum.",
        ]} />
      </Pasal>

      <Pasal no={5} judul="Keamanan">
        <Daftar butir={[
          "Berkas disimpan di penyimpanan privat dan hanya dibuka admin sekolah lewat tautan sementara sekitar 5 menit.",
          "Setiap tabel data dilindungi aturan akses per sekolah (row level security), dan akses publik hanya lewat fungsi yang dibatasi.",
          "Koneksi memakai HTTPS. Batas ukuran dan jenis berkas diperiksa di server.",
        ]} />
        <p>Tidak ada sistem yang sepenuhnya bebas risiko. Bila terjadi kebocoran data yang berdampak pada Anda, kami memberi tahu sekolah dan pihak terkait sesuai ketentuan yang berlaku.</p>
      </Pasal>

      <Pasal no={6} judul="Berapa lama data disimpan">
        <Daftar butir={[
          "Selama sekolah berlangganan, dan tetap tersimpan setelah sekolah nonaktif sampai dihapus.",
          "Sekolah dapat mengarsipkan atau menghapus data pendaftar tahun lalu. Penghapusan menghapus pula berkasnya.",
          <>Data sekolah nonaktif dapat dihapus setelah <mark>[DIISI: jangka waktu]</mark> dengan pemberitahuan ke admin sekolah.</>,
        ]} />
      </Pasal>

      <Pasal no={7} judul="Hak Anda">
        <p>Sesuai peraturan pelindungan data pribadi yang berlaku di Indonesia, Anda dapat meminta akses, perbaikan, atau penghapusan data anak Anda, atau menarik persetujuan. Karena sekolah yang memutuskan penggunaan data pendaftar, ajukan permintaan ke admin sekolah (lewat WhatsApp di halaman sekolah). Anda juga dapat menghubungi kami di kontak di bawah; kami akan meneruskannya ke sekolah.</p>
      </Pasal>

      <Pasal no={8} judul="Data anak">
        <p>Form pendaftaran diisi oleh orang tua atau wali. Dengan mencentang persetujuan, Anda menyatakan sebagai orang tua atau wali yang berhak mewakili anak, dan menyetujui data anak diproses sekolah untuk keperluan SPMB.</p>
      </Pasal>

      <Pasal no={9} judul="Penyimpanan di perangkat Anda">
        <Daftar butir={[
          "Isian form yang belum terkirim disimpan sementara di browser Anda (penyimpanan lokal) agar tidak hilang saat sinyal putus. Data ini dihapus setelah pendaftaran terkirim.",
          "Admin sekolah memakai cookie sesi untuk tetap masuk.",
          "Aplikasi dapat menyimpan halaman informasi sekolah dan aset statis di perangkat agar tetap terbuka saat sinyal lemah. Data pendaftar tidak pernah disimpan dengan cara ini.",
        ]} />
      </Pasal>

      <Pasal no={10} judul="Perubahan kebijakan">
        <p>Kebijakan ini dapat diperbarui. Tanggal berlaku tertera di bagian atas halaman, dan perubahan penting diberitahukan lewat sekolah atau aplikasi.</p>
      </Pasal>
    </KerangkaHukum>
  );
}
