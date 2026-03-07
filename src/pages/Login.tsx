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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center animate-pulse">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <span className="text-muted-foreground text-[13px]">Loading…</span>
        </div>
      </div>
    );
  }

  if (user && (!role || !approved)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary mx-auto mb-5">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2 tracking-[-0.02em]">Waiting for Approval</h1>
          <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">
            Your account has been created. Please wait for the owner to approve your account and assign a role before you can access the system.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => { window.location.reload(); }}
              className="px-4 py-2.5 rounded-lg border border-border text-[13px] font-medium hover:bg-accent active:scale-[0.98] transition-all"
            >
              Refresh
            </button>
            <button
              onClick={() => signOut()}
              className="px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all"
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

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-[13px] placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-ring/20 focus:border-ring outline-none transition-all";

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-[380px] animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/20">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-[-0.02em]">TechStock</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-6 card-shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className={inputClass} required />
              </div>
            )}
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} required />
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${inputClass} pr-10`} required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-[13px] text-destructive bg-destructive/5 px-3.5 py-2.5 rounded-lg border border-destructive/10">{error}</p>}
            {success && <p className="text-[13px] text-success bg-success/5 px-3.5 py-2.5 rounded-lg border border-success/10">{success}</p>}

            <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
              {submitting ? "Please wait…" : isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>
        </div>

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
