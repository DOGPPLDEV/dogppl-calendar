import { useState } from "react";
import { supabase } from "./supabase.js";

const BRAND = { bone:"#F3F1EE", paw:"#181818", grass:"#565F4E", rust:"#9A4536", sand:"#BFB3A5", drySage:"#8C8A7E" };

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "That email and password don't match. Try again."
        : error.message);
    }
  }

  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:BRAND.bone,color:BRAND.paw,fontFamily:"'Georgia',serif",padding:"20px"}}>
      <form onSubmit={onSubmit} style={{width:"100%",maxWidth:340,background:"#FFF",border:`1px solid ${BRAND.sand}`,borderRadius:6,padding:"28px 26px"}}>
        <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:BRAND.drySage,marginBottom:6}}>DOG PPL</div>
        <div style={{fontSize:22,fontWeight:700,lineHeight:1.2,marginBottom:4}}>Sign in</div>
        <div style={{fontSize:12,color:BRAND.drySage,marginBottom:20}}>Content Calendar 2026</div>

        <label style={{display:"block",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:BRAND.drySage,marginBottom:5}}>Email</label>
        <input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}
          style={{width:"100%",fontFamily:"inherit",fontSize:13,padding:"8px 10px",border:`1px solid ${BRAND.sand}`,borderRadius:4,background:BRAND.bone,color:BRAND.paw,outline:"none",boxSizing:"border-box",marginBottom:14}}/>

        <label style={{display:"block",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:BRAND.drySage,marginBottom:5}}>Password</label>
        <input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}
          style={{width:"100%",fontFamily:"inherit",fontSize:13,padding:"8px 10px",border:`1px solid ${BRAND.sand}`,borderRadius:4,background:BRAND.bone,color:BRAND.paw,outline:"none",boxSizing:"border-box",marginBottom:16}}/>

        {error && (
          <div style={{fontSize:12,color:BRAND.rust,background:"#FBEAE6",border:`1px solid ${BRAND.rust}33`,borderRadius:4,padding:"7px 10px",marginBottom:14}}>{error}</div>
        )}

        <button type="submit" disabled={submitting}
          style={{width:"100%",fontFamily:"inherit",fontSize:13,fontWeight:600,letterSpacing:"0.04em",padding:"10px 12px",borderRadius:4,border:"none",background:BRAND.paw,color:BRAND.bone,cursor:submitting?"default":"pointer",opacity:submitting?0.6:1}}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
