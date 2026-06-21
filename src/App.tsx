import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, ArrowRightLeft, CheckCircle, RefreshCcw, Play, Subtitles } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableItem } from './components/SortableItem';
import './types.d.ts';

function App() {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [subtitles, setSubtitles] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'info' | 'success' | 'error' } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSelectFolder = async () => {
    try {

      const path = await window.api.selectFolder();
      if (path) {
        setFolderPath(path);
        setStatusMsg({ text: 'Scanning folder...', type: 'info' });
        const res = await window.api.scanFolder(path);
        if (res.success) {
          setVideos(res.videos || []);
          setSubtitles(res.subtitles || []);
          setStatusMsg(null);
        } else {
          setStatusMsg({ text: res.error || 'Failed to scan', type: 'error' });
        }
      }
    } catch (e: any) {
      setStatusMsg({ text: e.message || 'Error selecting folder', type: 'error' });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSubtitles((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRename = async () => {
    if (!folderPath || videos.length === 0 || subtitles.length === 0) return;
    
    // Create pairings
    const pairings = videos.map((vid, idx) => ({
      video: vid,
      subtitle: subtitles[idx] || ''
    })).filter(p => p.subtitle !== '');

    setStatusMsg({ text: 'Renaming files...', type: 'info' });

    try {
      const res = await window.api.renameSubtitles(folderPath, pairings);
      if (res.success) {
        setStatusMsg({ text: 'Successfully paired and renamed subtitles!', type: 'success' });
        // Refresh
        const refreshRes = await window.api.scanFolder(folderPath);
        if (refreshRes.success) {
          setVideos(refreshRes.videos || []);
          setSubtitles(refreshRes.subtitles || []);
        }
      } else {
        setStatusMsg({ text: res.error || 'Failed to rename', type: 'error' });
      }
    } catch (e: any) {
      setStatusMsg({ text: e.message || 'Error renaming', type: 'error' });
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden text-white flex flex-col font-sans select-none">
      {/* Animated Gradient Background */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-80"
        animate={{
          background: [
            "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)",
            "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)",
            "linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)",
            "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)",
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Glass Overlay App Window */}
      <div className="relative z-10 flex flex-col h-full bg-black/10 backdrop-blur-xl">
        {/* Header / Titlebar Drag Region */}
        <div className="h-12 w-full flex items-center justify-between px-6 border-b border-white/10" style={{ WebkitAppRegion: 'drag' } as any}>
          <div className="flex items-center gap-2 font-semibold tracking-wider text-2xl opacity-90 font-['Outfit']">
            <Subtitles size={24} />
            Sub Sync
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          {/* Top Actions */}
          <div className="flex items-center justify-between glass-panel px-6 py-4 rounded-2xl">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={handleSelectFolder}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl font-medium shadow-lg"
              >
                <FolderOpen size={18} />
                Select Folder
              </button>
              <div className="text-sm opacity-70 truncate max-w-md">
                {folderPath || 'No folder selected'}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {statusMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl ${
                    statusMsg.type === 'success' ? 'bg-emerald-500/30 text-emerald-100' :
                    statusMsg.type === 'error' ? 'bg-red-500/30 text-red-100' :
                    'bg-white/10'
                  }`}
                >
                  {statusMsg.type === 'success' && <CheckCircle size={16} />}
                  {statusMsg.type === 'info' && <RefreshCcw size={16} className="animate-spin" />}
                  {statusMsg.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Grid Area */}
          {folderPath && (
            <div className="flex-1 min-h-0 flex gap-6">
              {/* Videos Column */}
              <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-white/10 bg-white/5 font-semibold flex items-center gap-2">
                  <Play size={16} className="text-blue-300" />
                  Videos ({videos.length})
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
                  {videos.map((vid, i) => (
                    <div key={vid} className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl flex items-center gap-3">
                      <div className="w-6 text-center text-xs opacity-50 font-mono">{i + 1}</div>
                      <div title={vid} className="truncate text-sm opacity-90">{vid}</div>
                    </div>
                  ))}
                  {videos.length === 0 && (
                    <div className="m-auto text-sm opacity-50">No videos found.</div>
                  )}
                </div>
              </div>

              {/* Linking Arrow */}
              <div className="flex items-center justify-center opacity-50">
                <ArrowRightLeft size={24} />
              </div>

              {/* Subtitles Column */}
              <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-white/10 bg-white/5 font-semibold flex items-center gap-2">
                  <Subtitles size={16} className="text-pink-300" />
                  Subtitles ({subtitles.length})
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {subtitles.length > 0 ? (
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={subtitles}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col gap-2">
                          {subtitles.map((sub, i) => (
                            <SortableItem key={sub} id={sub} index={i} />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm opacity-50">
                      No subtitles found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Area */}
        <div className="px-6 pb-6 pt-0 shrink-0 relative z-20 flex flex-col gap-4 items-center">
          {/* Embedded Ko-fi Button */}
          <a 
            href="https://ko-fi.com/sandika_" 
            target="_blank" 
            rel="noreferrer"
            className="glass-panel flex items-center justify-center gap-2 px-6 py-2 rounded-full font-medium shadow-xl hover:scale-105 hover:bg-white/20 transition-all duration-300 pointer-events-auto mt-auto"
          >
            <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Ko-fi" className="w-6 h-auto animate-bounce-slow" />
            Support me on Ko-fi
          </a>

          {videos.length > 0 && subtitles.length > 0 && (
            <button
              onClick={handleRename}
              className="w-full relative group overflow-hidden rounded-2xl p-[1px] transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
              <div className="relative glass-panel bg-black/40 hover:bg-black/20 transition-colors py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg tracking-wide shadow-2xl">
                <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                RENAME SUBTITLES
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
