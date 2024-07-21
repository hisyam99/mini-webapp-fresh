import { IS_BROWSER } from "$fresh/runtime.ts";

// Komponen LoginModal untuk menampilkan modal login
export default function LoginModal() {
    // Fungsi untuk membuka modal ketika tombol diklik
    const openModal = () => {
        // Memastikan kode hanya dijalankan di browser
        if (IS_BROWSER) {
            // Menampilkan modal dengan ID 'my_modal_3'
            (document.getElementById("my_modal_3") as HTMLDialogElement)
                .showModal();
        }
    };

    return (
        <>
            {/* Tombol untuk membuka modal login */}
            <button className="btn btn-primary" onClick={openModal}>
                Sign In
            </button>
            {/* Elemen dialog yang berfungsi sebagai modal */}
            <dialog id="my_modal_3" className="modal">
                <div className="modal-box">
                    {/* Form yang menggunakan method 'dialog' untuk menangani penutupan modal */}
                    <form method="dialog">
                        {/* Tombol untuk menutup modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                            ✕
                        </button>
                    </form>
                    {/* Judul modal */}
                    <h3 className="font-bold text-2xl">Sign In</h3>
                    {/* Deskripsi atau instruksi untuk pengguna */}
                    <p className="py-4">
                        Please sign in using one of the following methods:
                    </p>
                    {/* Daftar metode login */}
                    <div className="flex flex-col space-y-2">
                        {/* Tombol untuk login dengan Google */}
                        <a href="/signin/google" className="btn">
                            <img
                                width="20"
                                height="20"
                                src="/icon/google-icon.svg"
                                alt="Google"
                            />
                            Sign In with Google
                        </a>
                        {/* Tombol untuk login dengan Facebook */}
                        <a href="/signin/facebook" className="btn">
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
            </dialog>
        </>
    );
}
