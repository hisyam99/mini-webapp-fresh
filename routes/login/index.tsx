// Komponen LoginPage yang menampilkan halaman login
export default function LoginPage() {
    return (
        <div className="py-24 flex items-center justify-center">
            {/* Card utama untuk tampilan halaman login */}
            <div className="card shadow-lg w-full max-w-lg">
                <div className="card-body">
                    {/* Judul halaman login */}
                    <h2 className="text-2xl font-bold mb-4">Sign In</h2>

                    {/* Pesan kesalahan jika pengguna belum masuk */}
                    <p className="text-red-500 mb-4">
                        Oops! You need to sign in first.
                    </p>

                    {/* Bagian untuk tombol-tombol masuk menggunakan layanan pihak ketiga */}
                    <div className="flex flex-col space-y-4">
                        {/* Tombol untuk masuk menggunakan Google */}
                        <a
                            href="/signin/google?success_url=/dashboard"
                            className="btn"
                        >
                            <img
                                width="20"
                                height="20"
                                src="/icon/google-icon.svg"
                                alt="Google"
                            />
                            Sign In with Google
                        </a>

                        {/* Tombol untuk masuk menggunakan Facebook */}
                        <a
                            href="/signin/facebook?success_url=/dashboard"
                            className="btn"
                        >
                            <img
                                width="20"
                                height="20"
                                src="/icon/facebook-icon.svg"
                                alt="Facebook"
                            />
                            Sign In with Facebook
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
