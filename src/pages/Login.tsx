import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Package, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { user, loading, role, roleLoading, approved, signIn, signUp, signOut } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse text-muted-foreground text-[13px]">Loading…</div>
      </div>
    );
  }

  if (user && (!role || !approved)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary mb-4 mx-auto">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2">Waiting for Approval</h1>
          <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">
            Your account has been created. Please wait for the owner to approve your account and assign a role before you can access the system.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => { window.location.reload(); }}
              className="px-4 py-2 rounded-lg border border-border text-[13px] font-medium hover:bg-accent transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-[13px] font-medium hover:opacity-90 transition-opacity"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user && role && approved) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    if (isSignUp) {
      if (!fullName.trim()) {
        setError("Full name is required");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, fullName.trim());
      if (error) {
        setError(error);
      } else {
        setSuccess("Account created! Please wait for the owner to approve your access.");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }
    setSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-[360px]">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary mb-4">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">TechStock</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-[13px] placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring focus:border-transparent outline-none" required />
            </div>
          )}
          <div>
            <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-[13px] placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring focus:border-transparent outline-none" required />
          </div>
          <div>
            <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-background text-[13px] placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring focus:border-transparent outline-none" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-[13px] text-destructive bg-destructive/5 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-[13px] text-success bg-success/5 px-3 py-2 rounded-lg">{success}</p>}

          <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {submitting ? "Please wait…" : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p className="text-[13px] text-muted-foreground text-center mt-5">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); }} className="text-primary font-medium hover:underline">
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
