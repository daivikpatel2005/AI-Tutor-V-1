import React from 'react';
import {
  MessageCircleQuestion,
  GraduationCap,
  BookOpen,
  Microscope,
  BookmarkCheck,
  History,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTeaching } from '../../../state/teachingStore';

export type SidebarTab = 'learn' | 'ask' | 'books' | 'research' | 'library' | 'history';

interface ClassroomSidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenDoubt: () => void;
  onOpenNotes: () => void;
}

export const ClassroomSidebar: React.FC<ClassroomSidebarProps> = ({
  activeTab,
  onSelectTab,
  isExpanded,
  onToggleExpand,
  onOpenDoubt,
  onOpenNotes
}) => {
  const { toggleFullscreen } = useTeaching();

  const navItems: { id: SidebarTab; label: string; icon: React.ReactNode; badge?: string; action?: () => void }[] = [
    {
      id: 'learn',
      label: 'Learn',
      icon: <GraduationCap size={18} />,
      badge: 'Live'
    },
    {
      id: 'ask',
      label: 'Ask',
      icon: <MessageCircleQuestion size={18} />,
      action: onOpenDoubt
    },
    {
      id: 'books',
      label: 'Books',
      icon: <BookOpen size={18} />,
      badge: '55'
    },
    {
      id: 'research',
      label: 'Research',
      icon: <Microscope size={18} />,
      badge: 'RAG'
    },
    {
      id: 'library',
      label: 'Library',
      icon: <BookmarkCheck size={18} />,
      action: onOpenNotes
    },
    {
      id: 'history',
      label: 'History',
      icon: <History size={18} />
    }
  ];

  return (
    <aside
      aria-label="Classroom Navigation Sidebar"
      style={{
        width: isExpanded ? '210px' : '68px',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'linear-gradient(180deg, rgba(8, 12, 22, 0.96) 0%, rgba(5, 7, 14, 0.99) 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '0.85rem 0.5rem',
        zIndex: 35,
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      {/* Top: Nav Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Toggle Collapse/Expand Button */}
        <div style={{ display: 'flex', justifyContent: isExpanded ? 'flex-end' : 'center', padding: '0 4px 6px 4px' }}>
          <button
            onClick={onToggleExpand}
            title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Sidebar Nav Buttons */}
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  onSelectTab(item.id);
                }
              }}
              title={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isExpanded ? '10px 14px' : '10px 0',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                borderRadius: '10px',
                border: isActive
                  ? '1px solid rgba(56, 189, 248, 0.5)'
                  : '1px solid transparent',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%)'
                  : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                position: 'relative'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.5))' : 'none'
                }}
              >
                {item.icon}
              </div>

              {isExpanded && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#f8fafc' : '#94a3b8' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '999px',
                        background: isActive ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                        color: isActive ? '#38bdf8' : '#64748b'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom: Quick Classroom Utilities */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.07)', paddingTop: '10px' }}>
        {/* Fullscreen Button */}
        <button
          onClick={() => toggleFullscreen()}
          title="Fullscreen Classroom"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: isExpanded ? '8px 14px' : '8px 0',
            justifyContent: isExpanded ? 'flex-start' : 'center',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <Maximize2 size={16} />
          {isExpanded && <span style={{ fontSize: '0.78rem' }}>Fullscreen</span>}
        </button>
      </div>
    </aside>
  );
};
