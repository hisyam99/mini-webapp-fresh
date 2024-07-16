import { IS_BROWSER } from "$fresh/runtime.ts";

export default function LoginModal() {
    const openModal = () => {
        if (IS_BROWSER) {
            (document.getElementById("my_modal_3") as HTMLDialogElement)
                .showModal();
        }
    };

    return (
        <>
            <button className="btn btn-primary" onClick={openModal}>
                Sign In
            </button>
            <dialog id="my_modal_3" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                            ✕
                        </button>
                    </form>
                    <h3 className="font-bold text-2xl">Sign In</h3>
                    <p className="py-4">
                        Please sign in using one of the following methods:
                    </p>
                    <div className="flex flex-col space-y-2">
                        <a href="/signin/google" className="btn">
                            <img
                                width="20"
                                height="20"
                                src="/icon/google-icon.svg"
                                alt="Google"
                            />
                            Sign In with Google
                        </a>
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
