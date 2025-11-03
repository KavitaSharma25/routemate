import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Intro(){
  const nav = useNavigate()
  useEffect(()=>{
    const t = setTimeout(()=> nav('/', { replace: true }), 2200)
    return ()=> clearTimeout(t)
  },[])

  return (
    <div className="intro-screen w-full h-screen flex items-center justify-center bg-gradient-to-b from-[#F1EADA] to-[#CEC1A8]">
      <div className="intro-anim flex items-center gap-4">
        <div className="road h-24 w-64 relative overflow-hidden">
          <img 
            src="/src/assets/logo.png" 
            alt="RouteMate Logo" 
            className="logo absolute left-0 top-1/2 -translate-y-1/2"
          />
          <div className="road-line absolute bottom-3 left-0 right-0 h-1 bg-[#584738]" />
        </div>
      </div>
      <style>{`
        .road { background: linear-gradient(90deg, rgba(0,0,0,0.03), rgba(0,0,0,0.02)); border-radius:12px }
        .logo { width:80px; height: auto; object-fit: contain; transform: translateX(-100%); animation: drive 1.5s ease-in-out forwards }
        @keyframes drive { 0% { transform: translateX(-120%) translateY(-50%) } 60% { transform: translateX(20%) translateY(-50%) } 100% { transform: translateX(0%) translateY(-50%) } }
      `}</style>
    </div>
  )
}
