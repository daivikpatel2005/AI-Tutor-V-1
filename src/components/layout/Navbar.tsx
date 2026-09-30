import React from 'react';
import { useTeaching } from '../../state/teachingStore';
import { Sparkles, FileText, Monitor, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPage, navigateTo, student, openNotesModal, activeLesson } = useTeaching();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[rgba(7,8,12,0.85)] backdrop-blur-md">
      <div className="container-custom h-16 flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Brand */}
        <div 
          onClick={() => navigateTo('home')}
          className="cursor-pointer"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.35)'
          }}>
            <Sparkles size={18} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              AI TUTOR
            </span>
            <span style={{ fontSize: '0.65rem', marginLeft: '6px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', fontWeight: 600 }}>
              CLASSROOM v1
            </span>
          </div>
        </div>

        {/* Center Nav Switcher (ONLY 2 MAIN PAGES) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => navigateTo('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              background: currentPage === 'home' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: currentPage === 'home' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            <LayoutDashboard size={15} />
            Dashboard
          </button>
          <button
            onClick={() => navigateTo('teaching')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              background: currentPage === 'teaching' ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: currentPage === 'teaching' ? '#a5b4fc' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            <Monitor size={15} />
            Teaching Room
            {activeLesson && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            )}
          </button>
        </nav>

        {/* Right Actions: Notes & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => openNotesModal()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Access study notes & export PDF"
          >
            <FileText size={15} />
            Study Notes
          </button>

          {/* Student Profile Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px 4px 6px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#ffffff'
            }}>
              {student.name.charAt(0)}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {student.name.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
