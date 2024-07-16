export default function LoginPage() {
    return (
        <div className="py-24 flex items-center justify-center">
            <div className="card shadow-lg w-full max-w-lg">
                <div className="card-body">
                    <h2 className="text-2xl font-bold mb-4">Sign In</h2>
                    <p className="text-red-500 mb-4">Oops! You need to sign in first.</p>
                    <div className="flex flex-col space-y-4">
                        <a href="/signin/google?success_url=/dashboard" className="btn">
                            <img
                                width="20"
                                height="20"
                                src="/icon/google-icon.svg"
                                alt="Google"
                            />
                            Sign In with Google
                        </a>
                        <a href="/signin/facebook?success_url=/dashboard" className="btn">
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
