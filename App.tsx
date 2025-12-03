import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { BoardImage, PaperState, Position, ToolType, Size, StickerItem } from './types';

// --- Assets & Icons ---

const TextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#25586B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7V4h16v3" />
    <path d="M9 20h6" />
    <path d="M12 4v16" />
  </svg>
);

const PhotoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#25586B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const StickerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#25586B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const PaletteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#25586B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.66 0 1.34-.14 2-.42 1.5-.64 2-2.13 2-3.58 0-2.21-1.79-4-4-4-.55 0-1 .45-1 1s.45 1 1 1c1.1 0 2 1.34 2 3" />
  </svg>
);

const BulbIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#25586B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
    <path d="M9 21h6"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F0F4F8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const RotateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
  </svg>
);

const MoreIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

// --- Styling Constants ---
const COLORS = {
  FRAME: '#25586B',      // Deep Teal Frame
  SIDEBAR: '#9AB9CE',    // Sidebar Background
  BOARD: '#E4DFD3',      // Main Board Background (Warm Beige)
  PAPER: '#EBCFB9',      // Peach Paper
  BTN_GLASS: 'rgba(255, 255, 255, 0.4)',
  BTN_HOVER: 'rgba(255, 255, 255, 0.7)',
  TEXT_DARK: '#2C3E50',
};

const AVAILABLE_FONTS = [
  { name: 'Caveat', label: 'Handwritten (En)' },
  { name: 'Shadows Into Light', label: 'Marker (En)' },
  { name: 'Inter', label: 'Sans Serif' },
  { name: 'Ma Shan Zheng', label: '书法 (Ma Shan Zheng)' },
  { name: 'Zhi Mang Xing', label: '行书 (Zhi Mang Xing)' },
  { name: 'Long Cang', label: '草书 (Long Cang)' },
];

// --- Helper Functions ---

const getClientPos = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
  if ('touches' in e && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  // @ts-ignore
  return { x: e.clientX, y: e.clientY };
};

// --- Helper Hooks ---

const useDraggable = (
  initialPosition: Position, 
  onDragEnd: (pos: Position) => void,
  zIndex: number,
  onFocus: () => void,
  containerSize: Size | null,
  itemSize: Size | null,
  disabled: boolean = false
) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition.x, initialPosition.y]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    if ('touches' in e && e.touches.length > 1) return;
    
    e.stopPropagation();
    
    onFocus(); 
    setIsDragging(true);
    const clientPos = getClientPos(e);
    offset.current = {
      x: clientPos.x - position.x,
      y: clientPos.y - position.y,
    };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();
      
      const clientPos = getClientPos(e);
      let newX = clientPos.x - offset.current.x;
      let newY = clientPos.y - offset.current.y;

      // Apply Constraints
      if (containerSize && itemSize) {
          const maxX = Math.max(0, containerSize.width - itemSize.width);
          const maxY = Math.max(0, containerSize.height - itemSize.height);
          
          newX = Math.max(0, Math.min(newX, maxX));
          newY = Math.max(0, Math.min(newY, maxY));
      }

      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        onDragEnd(position);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, position, onDragEnd, containerSize, itemSize]);

  return { position, handleStart, isDragging, style: { left: position.x, top: position.y, zIndex } };
};

const useResizable = (
  initialSize: Size,
  onResizeEnd: (size: Size) => void,
  containerSize: Size | null,
  currentPosition: Position
) => {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef<Position>({ x: 0, y: 0 });
  const startSize = useRef<Size>(initialSize);

  // Update internal state if initialSize changes externally (e.g. via responsive logic)
  useEffect(() => {
    setSize(initialSize);
  }, [initialSize.width, initialSize.height]);

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    const clientPos = getClientPos(e);
    startPos.current = { x: clientPos.x, y: clientPos.y };
    startSize.current = size;
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return;
      if (e.cancelable) e.preventDefault();
      
      const clientPos = getClientPos(e);
      const deltaX = clientPos.x - startPos.current.x;
      const deltaY = clientPos.y - startPos.current.y;
      
      let newWidth = Math.max(100, startSize.current.width + deltaX);
      let newHeight = Math.max(100, startSize.current.height + deltaY);

      // Constraints
      if (containerSize) {
          const maxWidth = containerSize.width - currentPosition.x;
          const maxHeight = containerSize.height - currentPosition.y;
          newWidth = Math.min(newWidth, maxWidth);
          newHeight = Math.min(newHeight, maxHeight);
      }

      setSize({
        width: newWidth,
        height: newHeight,
      });
    };

    const handleEnd = () => {
      if (isResizing) {
        setIsResizing(false);
        onResizeEnd(size);
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isResizing, size, onResizeEnd, containerSize, currentPosition]);

  return { size, handleResizeStart, isResizing };
};

// Hook for scaling font size (used by Stickers)
const useScalable = (
    initialFontSize: number,
    onScaleEnd: (newFontSize: number) => void
) => {
    const [fontSize, setFontSize] = useState(initialFontSize);
    const [isScaling, setIsScaling] = useState(false);
    const startY = useRef(0);
    const startFontSize = useRef(initialFontSize);

    useEffect(() => {
        setFontSize(initialFontSize);
    }, [initialFontSize]);

    const handleScaleStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        setIsScaling(true);
        const clientPos = getClientPos(e);
        startY.current = clientPos.y;
        startFontSize.current = fontSize;
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!isScaling) return;
            if (e.cancelable) e.preventDefault();
            
            const clientPos = getClientPos(e);
            // Dragging down increases size, up decreases
            const deltaY = clientPos.y - startY.current;
            const scaleFactor = 1 + (deltaY * 0.005);
            const newSize = Math.max(12, Math.min(200, startFontSize.current * scaleFactor));
            setFontSize(newSize);
        };

        const handleEnd = () => {
            if (isScaling) {
                setIsScaling(false);
                onScaleEnd(fontSize);
            }
        };

        if (isScaling) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isScaling, fontSize, onScaleEnd]);

    return { fontSize, handleScaleStart, isScaling };
};

const useRotatable = (
  initialRotation: number,
  onRotateEnd: (deg: number) => void
) => {
  const [rotation, setRotation] = useState(initialRotation);
  const [isRotating, setIsRotating] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const startAngleRef = useRef(0);
  const startRotationRef = useRef(0);

  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!elementRef.current) return;
    
    setIsRotating(true);
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientPos = getClientPos(e);
    startAngleRef.current = Math.atan2(clientPos.y - centerY, clientPos.x - centerX);
    startRotationRef.current = rotation;
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isRotating || !elementRef.current) return;
      if (e.cancelable) e.preventDefault();
      
      const clientPos = getClientPos(e);
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const currentAngle = Math.atan2(clientPos.y - centerY, clientPos.x - centerX);
      const angleDelta = currentAngle - startAngleRef.current;
      const degDelta = angleDelta * (180 / Math.PI);
      
      setRotation(startRotationRef.current + degDelta);
    };

    const handleEnd = () => {
      if (isRotating) {
        setIsRotating(false);
        onRotateEnd(rotation);
      }
    };

    if (isRotating) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isRotating, rotation, onRotateEnd]);

  return { rotation, handleRotateStart, isRotating, elementRef };
};

// --- Components ---

const Sidebar = ({ 
  onAddImage, 
  onAddSticker,
  onExport, 
  onToggleShadow,
  setPaperColor,
  onChangeFont,
  onChangeFontSize,
  activeTool,
  setActiveTool,
  setPaper,
  paperColor,
  currentFont, 
  currentFontSize, 
  setBgColor,
  shadowEnabled
}: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onAddImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const quickColors = [
    '#EBCFB9', // Peach
    '#EAD985', // Yellow
    '#EAB9C5', // Pink
    '#B9EAC2'  // Green
  ];

  const extendedColors = [
    '#FFFFFF', // White
    '#D7D7D7', // Grey
    '#C4DEF6', // Blue
    '#E2C4F6', // Purple
    '#F6C4C4', // Reddish
    '#F6EAC4', // Cream
    '#C4F6D3', // Mint
    '#C4F6F2'  // Aqua
  ];

  const bgColors = [
    '#E4DFD3', // Classic Beige
    '#D3E4E2', // Soft Teal
    '#E4D3D3', // Dusty Rose
    '#D3D5E4', // Periwinkle
    '#F0F4F8', // Cool Grey
    '#181E23', // Dark Mode
  ];

  const aestheticEmojis = [
    '🌿', '🍄', '✨', '🌙', '☁️', '🌸', '🌷', '🌻',
    '📌', '📎', '🧸', '🤎', '🥨', '☕️', '📷', '📀',
    '🕯️', '🗝️', '💌', '📮'
  ];

  return (
    <div 
      className="md:h-full md:w-[110px] w-full h-[80px] flex md:flex-col flex-row items-center md:py-6 py-2 md:px-0 px-4 gap-4 md:gap-6 relative z-[10000] md:border-r md:border-t-0 border-t border-white/20 shadow-xl justify-between md:justify-start"
      style={{ backgroundColor: COLORS.SIDEBAR }}
    >
      {/* Top Color Widget (Paper Colors) - Desktop Only */}
      <div className="bg-[#F0F4F8] p-1.5 rounded-lg shadow-md md:w-20 w-12 flex flex-col md:flex-col flex-row gap-1 relative hidden md:flex">
        <div className="grid grid-cols-2 gap-1.5">
          {quickColors.map((c) => (
             <div 
                key={c}
                onClick={() => setPaperColor(c)}
                className="w-full aspect-square rounded-[3px] cursor-pointer hover:opacity-80 transition-opacity border border-black/5"
                style={{ backgroundColor: c }}
             />
          ))}
        </div>
        <div 
            onClick={() => setActiveTool(activeTool === 'PAPER_EXT' ? 'NONE' : 'PAPER_EXT')}
            className="w-full h-5 bg-[#4A90E2] rounded-[3px] flex items-center justify-center cursor-pointer hover:bg-[#357ABD] transition-colors"
        >
            <MoreIcon />
        </div>
      </div>

      {/* Tools Container */}
      <div className="flex md:flex-col flex-row gap-4 md:gap-6 w-full items-center md:mt-4 relative justify-center">
        
        {/* Mobile: Paper Color Trigger */}
        <button 
          onClick={() => setActiveTool(activeTool === 'PAPER_EXT' ? 'NONE' : 'PAPER_EXT')}
          className="md:hidden w-10 h-10 rounded-full bg-[#F0F4F8] flex items-center justify-center shadow-sm"
        >
            <div className="w-6 h-6 rounded bg-[#EBCFB9] border border-black/10"></div>
        </button>

        {/* Paper Colors Popup (Shared for Desktop & Mobile) */}
        {activeTool === 'PAPER_EXT' && (
             <div className="absolute md:left-[90px] md:top-0 bottom-[90px] left-4 bg-white p-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-left-2 z-[60] w-40 tool-popup">
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Paper Colors</p>
                <div className="grid grid-cols-4 gap-2">
                    {extendedColors.map(c => (
                        <div 
                            key={c}
                            onClick={() => { setPaperColor(c); setActiveTool('NONE'); }}
                            className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>
        )}

        {/* Font Settings */}
        <button 
          onClick={() => setActiveTool(activeTool === 'FONT' ? 'NONE' : 'FONT')}
          className={`md:w-14 md:h-14 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm backdrop-blur-sm ${activeTool === 'FONT' ? 'ring-2 ring-[#25586B] scale-110' : ''}`}
          style={{ backgroundColor: COLORS.BTN_GLASS }}
          title="Change Font & Size"
        >
          <TextIcon />
        </button>

        {activeTool === 'FONT' && (
             <div className="absolute md:left-[100px] md:top-0 bottom-[90px] left-1/2 -translate-x-1/2 md:translate-x-0 bg-white p-4 rounded-xl shadow-xl animate-in fade-in slide-in-from-left-2 z-[60] w-64 tool-popup">
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Size</span>
                        <span className="text-xs font-medium text-gray-400">{currentFontSize}px</span>
                    </div>
                    <input 
                        type="range" 
                        min="12" 
                        max="120" 
                        value={currentFontSize} 
                        onChange={(e) => onChangeFontSize(Number(e.target.value))}
                        className="w-full h-8 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#25586B]"
                    />
                </div>

                <div className="h-px bg-gray-100 mb-3" />

                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Font Family</p>
                <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {AVAILABLE_FONTS.map(font => (
                        <button
                            key={font.name}
                            onClick={() => { onChangeFont(font.name); }}
                            className={`text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-lg ${currentFont === font.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                            style={{ fontFamily: font.name }}
                        >
                            {font.label}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Image Upload */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="md:w-14 md:h-14 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm backdrop-blur-sm"
          style={{ backgroundColor: COLORS.BTN_GLASS }}
          title="Add Photo"
        >
          <PhotoIcon />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

        {/* Stickers & Text */}
        <button 
          onClick={() => setActiveTool(activeTool === 'STICKER' ? 'NONE' : 'STICKER')}
          className={`md:w-14 md:h-14 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm backdrop-blur-sm ${activeTool === 'STICKER' ? 'ring-2 ring-[#25586B] scale-110' : ''}`}
          style={{ backgroundColor: COLORS.BTN_GLASS }}
          title="Add Sticker or Text"
        >
          <StickerIcon />
        </button>

         {activeTool === 'STICKER' && (
             <div className="absolute md:left-[100px] md:top-[140px] bottom-[90px] left-1/2 -translate-x-1/2 md:translate-x-0 bg-white p-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-left-2 z-[60] w-56 tool-popup">
                <button
                    onClick={() => { onAddSticker('text'); setActiveTool('NONE'); }}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg mb-4 font-semibold transition-colors"
                >
                    <PlusIcon /> Add Text
                </button>
                
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Stickers</p>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {aestheticEmojis.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => { onAddSticker('emoji', emoji); setActiveTool('NONE'); }}
                            className="text-2xl hover:scale-125 transition-transform p-1"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        )}


        {/* Background Color */}
        <button 
          onClick={() => setActiveTool(activeTool === 'BG' ? 'NONE' : 'BG')}
          className={`md:w-14 md:h-14 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm backdrop-blur-sm ${activeTool === 'BG' ? 'ring-2 ring-[#25586B] scale-110' : ''}`}
          style={{ backgroundColor: COLORS.BTN_GLASS }}
          title="Change Board Color"
        >
          <PaletteIcon />
        </button>

        {/* Shadow Toggle */}
        <button 
          onClick={onToggleShadow}
          className={`md:w-14 md:h-14 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm backdrop-blur-sm ${shadowEnabled ? 'bg-yellow-100/50 ring-2 ring-yellow-400/50' : ''}`}
          style={{ backgroundColor: shadowEnabled ? 'rgba(255, 240, 200, 0.4)' : COLORS.BTN_GLASS }}
          title="Toggle Shadow"
        >
          <BulbIcon />
        </button>

        {activeTool === 'BG' && (
            <div className="absolute md:left-[100px] md:top-[240px] bottom-[90px] right-0 md:right-auto bg-white p-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-left-2 z-[60] w-40 tool-popup">
               <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Board Color</p>
               <div className="grid grid-cols-2 gap-2">
                 {bgColors.map(c => (
                   <div 
                     key={c}
                     onClick={() => { setBgColor(c); setActiveTool('NONE'); }} 
                     className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform shadow-sm"
                     style={{ backgroundColor: c }}
                   />
                 ))}
               </div>
            </div>
          )}

      </div>

      <div className="flex-1 md:block hidden" />

      {/* Download */}
      <button 
        onClick={onExport}
        className="md:w-14 md:h-14 w-10 h-10 rounded-full bg-[#4A6C85] text-white flex items-center justify-center transition-all hover:bg-[#3A5C75] shadow-lg md:mb-6 hover:scale-105"
      >
        <DownloadIcon />
      </button>

    </div>
  );
};

interface PaperProps {
    state: PaperState; 
    setState: (s: any) => void;
    zIndex: number;
    onFocus: () => void;
    containerSize: Size | null;
}

const LetterPaper = ({ 
  state, 
  setState, 
  zIndex, 
  onFocus,
  containerSize
}: PaperProps) => {
  const { position, handleStart, style, isDragging } = useDraggable(
    state.position,
    (newPos) => setState({ ...state, position: newPos }),
    zIndex,
    onFocus,
    containerSize,
    state.size
  );

  const { size, handleResizeStart } = useResizable(
    state.size,
    (newSize) => setState({ ...state, size: newSize }),
    containerSize,
    state.position
  );

  return (
    <div 
      className={`absolute transition-transform duration-200 ease-out ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} group touch-none`}
      style={{
        ...style,
        width: size.width,
        height: size.height,
        maxWidth: '100%',
        maxHeight: '100%',
        transform: `rotate(${state.rotation}deg)`,
      }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div 
        className="w-full h-full relative z-10"
        style={{
          backgroundColor: state.color,
          boxShadow: '40px 50px 90px rgba(0,0,0,0.6), 0 15px 30px rgba(0,0,0,0.2)', 
        }}
      >
        <div 
            className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" 
            style={{ backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMDAgMjAwJz48ZmlsdGVyIGlkPSdub2lzZUZpbHRlcic+PGZlVHVyYnVsZW5jZSB0eXBlPSdmcmFjdGFsTm9pc2UnIGJhc2VGcmVxdWVuY3k9JzAuNjUnIG51bU9jdGF2ZXM9JzMnIHN0aXRjaFRpbGVzPSdzdGl0Y2gnLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWx0ZXI9J3VybCgjbm9pc2VGaWx0ZXIpJyBvcGFjaXR5PScwLjEnLz48L3N2Zz4=") `}}
        ></div>

        <div className="w-full h-full p-6 md:p-12 relative z-10">
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none border-none leading-loose text-gray-800 opacity-90"
            style={{ 
                fontFamily: state.font || 'Caveat',
                fontSize: `${state.fontSize || 24}px`
            }}
            value={state.text}
            onChange={(e) => setState({...state, text: e.target.value})}
            placeholder="Write something..."
            spellCheck={false}
            onMouseDown={(e) => { e.stopPropagation(); onFocus(); }} 
            onTouchStart={(e) => { e.stopPropagation(); onFocus(); }}
            onFocus={onFocus} 
          />
        </div>

        <div 
          className="absolute bottom-4 right-4 p-4 cursor-nwse-resize opacity-100 z-50 transition-opacity"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          <div className="w-6 h-6 border-r-4 border-b-4 border-black/10 rounded-br-md"></div>
        </div>
      </div>
    </div>
  );
};

const PhotoItem: React.FC<{ 
  image: BoardImage;
  updateImage: (id: string, updates: Partial<BoardImage>) => void;
  onRemove: (id: string) => void;
  onFocus: () => void;
  isFocused: boolean;
  containerSize: Size | null;
}> = ({ 
  image, 
  updateImage, 
  onRemove, 
  onFocus,
  isFocused,
  containerSize
}) => {
  const { rotation, handleRotateStart, isRotating, elementRef } = useRotatable(
    image.rotation,
    (deg) => updateImage(image.id, { rotation: deg })
  );

  const { position, handleStart, style, isDragging } = useDraggable(
    image.position,
    (newPos) => updateImage(image.id, { position: newPos }),
    image.zIndex,
    onFocus,
    containerSize,
    { width: image.width, height: image.height },
    isRotating
  );

  const { size, handleResizeStart } = useResizable(
    { width: image.width, height: image.height },
    (newSize) => updateImage(image.id, { width: newSize.width, height: newSize.height }),
    containerSize,
    image.position
  );

  return (
    <div
      ref={elementRef}
      className={`absolute group transition-transform duration-75 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none touch-none`}
      style={{
        ...style,
        width: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
        transform: `rotate(${rotation}deg)`,
        zIndex: isDragging || isRotating ? 999 : image.zIndex,
      }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div 
        className={`bg-white p-3 pb-3 shadow-xl hover:shadow-2xl transition-all duration-300 relative ${isFocused ? 'ring-2 ring-blue-400 ring-offset-4 ring-offset-transparent border-blue-400 border-dashed border focused-item' : ''}`}
        style={{
            boxShadow: '30px 40px 70px rgba(0,0,0,0.5)',
        }}
      >
        <div 
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-30 text-gray-600 hover:text-blue-500 hover:scale-110"
            onMouseDown={handleRotateStart}
            onTouchStart={handleRotateStart}
        >
            <RotateIcon />
            <div className="absolute top-full left-1/2 w-0.5 h-4 bg-white/80 -translate-x-1/2"></div>
        </div>

        <button 
            className="absolute -top-3 -right-3 bg-white text-red-500 border border-gray-200 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm z-30"
            onClick={(e) => { e.stopPropagation(); onRemove(image.id); }}
            onTouchStart={(e) => { e.stopPropagation(); onRemove(image.id); }}
        >
            <TrashIcon />
        </button>

        <div 
            className="bg-gray-100 relative overflow-hidden border border-black/5"
            style={{ width: size.width, height: size.height, maxWidth: '100%' }}
        >
          <img 
            src={image.src} 
            alt="Memory" 
            className="w-full h-full object-cover pointer-events-none block" 
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
        </div>

        <div 
            className="pt-3 pb-1"
            style={{ width: size.width, maxWidth: '100%' }}
        >
             <input 
                type="text" 
                className="w-full text-center text-gray-600 bg-transparent border-none outline-none placeholder:text-gray-300"
                style={{ 
                    fontFamily: image.font || 'Caveat',
                    fontSize: `${image.fontSize || 20}px` 
                }}
                placeholder="Add caption..."
                value={image.caption || ''}
                onChange={(e) => updateImage(image.id, { caption: e.target.value })}
                onMouseDown={(e) => { e.stopPropagation(); onFocus(); }} 
                onTouchStart={(e) => { e.stopPropagation(); onFocus(); }}
                onFocus={onFocus}
             />
        </div>

        <div 
          className="absolute bottom-1 right-1 p-2 cursor-nwse-resize opacity-0 group-hover:opacity-100 z-50 transition-opacity"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          <div className="w-3 h-3 border-r-2 border-b-2 border-gray-400"></div>
        </div>

      </div>
    </div>
  );
};

const StickerComponent: React.FC<{
  sticker: StickerItem;
  updateSticker: (id: string, updates: Partial<StickerItem>) => void;
  onRemove: (id: string) => void;
  onFocus: () => void;
  onToggleFont?: () => void;
  isFocused: boolean;
  containerSize: Size | null;
}> = ({ sticker, updateSticker, onRemove, onFocus, onToggleFont, isFocused, containerSize }) => {
    
  const { rotation, handleRotateStart, isRotating, elementRef } = useRotatable(
    sticker.rotation,
    (deg) => updateSticker(sticker.id, { rotation: deg })
  );

  // We need to measure sticker size for constraints since it's dynamic
  const [size, setSize] = useState<Size>({ width: 50, height: 50 });
  
  useEffect(() => {
      if (elementRef.current) {
          setSize({ 
              width: elementRef.current.offsetWidth, 
              height: elementRef.current.offsetHeight 
          });
      }
  }, [sticker.fontSize, sticker.content, sticker.scale]);

  const { position, handleStart, style, isDragging } = useDraggable(
    sticker.position,
    (newPos) => updateSticker(sticker.id, { position: newPos }),
    sticker.zIndex,
    onFocus,
    containerSize,
    size, // Pass measured size
    isRotating
  );

  // Use scalable hook to update fontSize when resizing
  const { fontSize: dynamicFontSize, handleScaleStart, isScaling } = useScalable(
      sticker.fontSize || (sticker.type === 'emoji' ? 64 : 32),
      (newSize) => updateSticker(sticker.id, { fontSize: newSize })
  );

  return (
    <div
      ref={elementRef}
      className={`absolute group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none touch-none`}
      style={{
        ...style,
        transform: `rotate(${rotation}deg) scale(${sticker.scale})`,
        zIndex: isDragging || isRotating ? 999 : sticker.zIndex,
        maxWidth: '100%',
        maxHeight: '100%',
      }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
        <div className={`relative p-2 ${isFocused ? 'border-2 border-dashed border-[#4A90E2] rounded-lg bg-white/10 focused-item' : ''}`}>
             <div 
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-30 text-gray-600"
                onMouseDown={handleRotateStart}
                onTouchStart={handleRotateStart}
            >
                <RotateIcon />
            </div>
             <button 
                className="absolute -top-4 -right-4 bg-white text-red-500 border border-gray-200 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-30 hover:scale-110"
                onClick={(e) => { e.stopPropagation(); onRemove(sticker.id); }}
                onTouchStart={(e) => { e.stopPropagation(); onRemove(sticker.id); }}
            >
                <TrashIcon />
            </button>

            {sticker.type === 'text' && onToggleFont && (
                <button 
                    className="absolute -top-4 -left-4 bg-white text-gray-700 border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm z-30 hover:bg-gray-50 hover:scale-110"
                    onClick={(e) => { e.stopPropagation(); onToggleFont(); }}
                    onTouchStart={(e) => { e.stopPropagation(); onToggleFont(); }}
                    title="Cycle Font"
                >
                    <span className="font-serif font-bold text-sm">Aa</span>
                </button>
            )}

            {sticker.type === 'emoji' ? (
                <div 
                    className="drop-shadow-md cursor-default select-none"
                    style={{ fontSize: `${isScaling ? dynamicFontSize : (sticker.fontSize || 64)}px` }}
                >
                    {sticker.content}
                </div>
            ) : (
                <div className="min-w-[50px] min-h-[40px]">
                     <textarea
                        className="w-full h-full bg-transparent resize-none outline-none border-none text-gray-800 text-center whitespace-pre-wrap overflow-hidden"
                        style={{ 
                            fontFamily: sticker.font || 'Caveat',
                            fontSize: `${isScaling ? dynamicFontSize : (sticker.fontSize || 32)}px`,
                            lineHeight: '1.2'
                        }}
                        value={sticker.content}
                        onChange={(e) => updateSticker(sticker.id, { content: e.target.value })}
                        placeholder="Type here..."
                        spellCheck={false}
                        onMouseDown={(e) => { e.stopPropagation(); onFocus(); }} 
                        onTouchStart={(e) => { e.stopPropagation(); onFocus(); }}
                        onFocus={onFocus}
                      />
                </div>
            )}

            {/* Resize handle for sticker (scales font size) */}
            <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-300 rounded-full shadow cursor-nwse-resize opacity-0 group-hover:opacity-100 z-50 flex items-center justify-center"
                onMouseDown={handleScaleStart}
                onTouchStart={handleScaleStart}
            >
                <div className="w-1.5 h-1.5 bg-[#4A90E2] rounded-full"></div>
            </div>
        </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType | 'BG' | 'FONT' | 'PAPER_EXT' | 'STICKER' | 'NONE'>('NONE');
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [shadowEnabled, setShadowEnabled] = useState(true);
  
  const [focusedId, setFocusedId] = useState<string>('paper');
  const [bgColor, setBgColor] = useState(COLORS.BOARD);

  // Initialize state based on screen size
  const [isMobile, setIsMobile] = useState(false);
  
  // Track container dimensions for responsiveness
  const canvasRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState<Size | null>(null);

  const [paper, setPaper] = useState<PaperState>({
    color: COLORS.PAPER,
    text: "August 24th,\n\nThe light hits the kitchen table just like it did in our old house. I made coffee and thought of you.",
    position: { x: 50, y: 40 },
    rotation: 0,
    size: { width: 500, height: 600 },
    font: 'Caveat',
    fontSize: 24
  });

  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [images, setImages] = useState<BoardImage[]>([]);

  useEffect(() => {
    // Check for mobile on mount and adjust initial layout
    const checkMobile = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const mobile = width < 768;
        setIsMobile(mobile);
        
        // If mobile, calculate responsive sizes based on viewport
        if (mobile) {
            const margin = 20;
            const bottomBarHeight = 90; // Approx height of bottom toolbar + padding
            const safeHeight = height - bottomBarHeight;
            
            // Paper: 82% width, ~55% height, centered
            const paperW = Math.min(width * 0.82, 350); 
            const paperH = Math.min(safeHeight * 0.55, 500);
            
            const paperX = (width - paperW) / 2;
            const paperY = margin + 10;

            setPaper({
                color: COLORS.PAPER,
                text: "August 24th,\n\nThe light hits the kitchen table just like it did in our old house. I made coffee and thought of you.",
                position: { x: paperX, y: paperY },
                rotation: -1.5,
                size: { width: paperW, height: paperH },
                font: 'Caveat',
                fontSize: 18
            });
            
            // Responsive Image Initial State
            const imgSize = Math.min(width * 0.38, 150);
            // Position image overlapping bottom-right of paper slightly for collage look
            const imgX = paperX + paperW - imgSize + 10;
            const imgY = paperY + paperH - (imgSize / 2);

            setImages([
                {
                    id: '1',
                    src: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
                    position: { x: Math.min(imgX, width - imgSize - 10), y: imgY },
                    rotation: 3,
                    width: imgSize,
                    height: imgSize,
                    zIndex: 2,
                    caption: '',
                    font: 'Caveat',
                    fontSize: 14
                }
            ]);

             setStickers([
                {
                    id: 's1',
                    type: 'emoji',
                    content: '🌿',
                    position: { x: paperX + paperW - 30, y: paperY - 10 },
                    rotation: 15,
                    scale: 0.8,
                    zIndex: 6,
                    fontSize: 42
                }
            ]);

        } else {
             // Desktop Defaults
             setPaper({
                color: COLORS.PAPER,
                text: "August 24th,\n\nThe light hits the kitchen table just like it did in our old house. I made coffee and thought of you.",
                position: { x: 50, y: 40 },
                rotation: 0,
                size: { width: 500, height: 600 },
                font: 'Caveat',
                fontSize: 24
            });
             setImages([
                {
                    id: '1',
                    src: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
                    position: { x: 600, y: 120 },
                    rotation: 2,
                    width: 240,
                    height: 240,
                    zIndex: 2,
                    caption: '',
                    font: 'Caveat',
                    fontSize: 20
                },
                {
                    id: '2',
                    src: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
                    position: { x: 600, y: 450 },
                    rotation: -2,
                    width: 240,
                    height: 180, 
                    zIndex: 3,
                    caption: 'Work corner ☕️',
                    font: 'Caveat',
                    fontSize: 20
                },
                {
                    id: '3',
                    src: 'https://images.unsplash.com/photo-1516550893923-42d28e560348?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
                    position: { x: 800, y: 450 },
                    rotation: 1,
                    width: 200,
                    height: 240, 
                    zIndex: 4,
                    caption: '',
                    font: 'Caveat',
                    fontSize: 20
                },
                {
                    id: '4',
                    src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
                    position: { x: 1000, y: 430 },
                    rotation: 4,
                    width: 220,
                    height: 220,
                    zIndex: 5,
                    caption: 'Miso ❤️',
                    font: 'Caveat',
                    fontSize: 20
                }
              ]);
              setStickers([
                  {
                      id: 's1',
                      type: 'emoji',
                      content: '🌿',
                      position: { x: 900, y: 80 },
                      rotation: 15,
                      scale: 1,
                      zIndex: 6,
                      fontSize: 72
                  },
                  {
                      id: 's2',
                      type: 'text',
                      content: 'memories...',
                      position: { x: 450, y: 650 },
                      rotation: -5,
                      scale: 1,
                      zIndex: 6,
                      font: 'Caveat',
                      fontSize: 32
                  }
              ]);
        }
    }
    
    checkMobile();
    
    // Resize Observer for dynamic container sizing
    if (canvasRef.current) {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setContainerDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        observer.observe(canvasRef.current);
        return () => observer.disconnect();
    }
    
    // Add resize listener to update isMobile state
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, []);

  // --- Layout Constraint Logic ---
  // When container changes (window resize), ensure items stay inside
  useLayoutEffect(() => {
      if (!containerDimensions) return;
      
      const { width: cWidth, height: cHeight } = containerDimensions;

      // 1. Safety Check: If container is reported as 0 or extremely small (initial load glitch), ignore to prevent crushing content
      if (cWidth < 50 || cHeight < 50) return;

      // 2. Clamp Paper
      setPaper(prev => {
          // Shrink if too big, but ensure min width/height so it doesn't disappear
          let newW = Math.min(prev.size.width, cWidth);
          newW = Math.max(100, newW); // Min width 100px

          let newH = Math.min(prev.size.height, cHeight);
          newH = Math.max(100, newH); // Min height 100px
          
          // Move if out of bounds
          const maxX = cWidth - newW;
          const maxY = cHeight - newH;
          const newX = Math.max(0, Math.min(prev.position.x, maxX));
          const newY = Math.max(0, Math.min(prev.position.y, maxY));
          
          if (newW !== prev.size.width || newH !== prev.size.height || newX !== prev.position.x || newY !== prev.position.y) {
              return { ...prev, size: { width: newW, height: newH }, position: { x: newX, y: newY } };
          }
          return prev;
      });

      // 3. Clamp Images
      setImages(prev => prev.map(img => {
          let newW = Math.min(img.width, cWidth);
          newW = Math.max(50, newW);
          
          let newH = Math.min(img.height, cHeight);
          newH = Math.max(50, newH);

          const maxX = cWidth - newW;
          const maxY = cHeight - newH;
          const newX = Math.max(0, Math.min(img.position.x, maxX));
          const newY = Math.max(0, Math.min(img.position.y, maxY));

          if (newW !== img.width || newH !== img.height || newX !== img.position.x || newY !== img.position.y) {
              return { ...img, width: newW, height: newH, position: { x: newX, y: newY } };
          }
          return img;
      }));
      
      // 4. Clamp Stickers (Approximate)
      setStickers(prev => prev.map(s => {
          const estimatedSize = 60; // Safe buffer
          const maxX = cWidth - estimatedSize;
          const maxY = cHeight - estimatedSize;
          const newX = Math.max(0, Math.min(s.position.x, maxX));
          const newY = Math.max(0, Math.min(s.position.y, maxY));
          
          if (newX !== s.position.x || newY !== s.position.y) {
              return { ...s, position: { x: newX, y: newY } };
          }
          return s;
      }));

  }, [containerDimensions]);


  const appContainerRef = useRef<HTMLDivElement>(null);

  const handleAddImage = (src: string) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        const aspect = img.width / img.height;
        const initialWidth = isMobile ? window.innerWidth * 0.4 : 240;
        const initialHeight = initialWidth / aspect;

        const newImage: BoardImage = {
          id: Date.now().toString(),
          src,
          position: { x: isMobile ? 50 : 600 + (Math.random() * 50), y: isMobile ? 100 : 150 + (Math.random() * 50) },
          rotation: (Math.random() * 6) - 3,
          width: initialWidth,
          height: initialHeight,
          zIndex: maxZIndex + 1,
          font: 'Caveat',
          fontSize: 20
        };
        setMaxZIndex(prev => prev + 1);
        setImages(prev => [...prev, newImage]);
        setFocusedId(newImage.id); 
    };
  };

  const handleAddSticker = (type: 'emoji' | 'text', content: string = '') => {
      const newSticker: StickerItem = {
          id: Date.now().toString(),
          type,
          content: content,
          position: { x: isMobile ? window.innerWidth / 2 - 50 : 600 + (Math.random() * 50), y: isMobile ? window.innerHeight / 2 : 300 + (Math.random() * 50) },
          rotation: (Math.random() * 10) - 5,
          scale: 1,
          zIndex: maxZIndex + 1,
          font: 'Caveat', 
          fontSize: type === 'emoji' ? 64 : 32
      };
      setMaxZIndex(prev => prev + 1);
      setStickers(prev => [...prev, newSticker]);
      setFocusedId(newSticker.id); 
  }

  const updateImage = (id: string, updates: Partial<BoardImage>) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  const updateSticker = (id: string, updates: Partial<StickerItem>) => {
      setStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (focusedId === id) setFocusedId('paper');
  };
  
  const removeSticker = (id: string) => {
      setStickers(prev => prev.filter(s => s.id !== id));
      if (focusedId === id) setFocusedId('paper');
  }

  const bringToFront = (id: string | 'paper') => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setFocusedId(id);

    if (id === 'paper') return;

    // Check stickers and update zIndex
    const isSticker = stickers.some(s => s.id === id);
    if (isSticker) {
        setStickers(prev => prev.map(s => s.id === id ? { ...s, zIndex: newZ } : s));
        return;
    }

    // Check images and update zIndex
    const isImage = images.some(img => img.id === id);
    if (isImage) {
        setImages(prev => prev.map(img => img.id === id ? { ...img, zIndex: newZ } : img));
    }
  };

  const handleFontChange = (fontName: string) => {
      if (focusedId === 'paper') {
          setPaper(p => ({ ...p, font: fontName }));
          return;
      }

      const targetSticker = stickers.find(s => s.id === focusedId);
      if (targetSticker) {
          updateSticker(focusedId, { font: fontName });
          return;
      }

      const targetImage = images.find(img => img.id === focusedId);
      if (targetImage) {
          updateImage(focusedId, { font: fontName });
          return;
      }
      
      // Fallback
      setPaper(p => ({ ...p, font: fontName }));
  };

  const handleFontSizeChange = (size: number) => {
      if (focusedId === 'paper') {
          setPaper(p => ({ ...p, fontSize: size }));
          return;
      }

      const targetSticker = stickers.find(s => s.id === focusedId);
      if (targetSticker) {
          updateSticker(focusedId, { fontSize: size });
          return;
      }

      const targetImage = images.find(img => img.id === focusedId);
      if (targetImage) {
          updateImage(focusedId, { fontSize: size });
          return;
      }

       setPaper(p => ({ ...p, fontSize: size }));
  };

  // Cycle through available fonts for a specific sticker
  const cycleFont = (id: string) => {
      const sticker = stickers.find(s => s.id === id);
      if (!sticker || sticker.type !== 'text') return;
      
      const currentFont = sticker.font || 'Caveat';
      const currentIndex = AVAILABLE_FONTS.findIndex(f => f.name === currentFont);
      const nextIndex = (currentIndex + 1) % AVAILABLE_FONTS.length;
      updateSticker(id, { font: AVAILABLE_FONTS[nextIndex].name });
  };

  const getCurrentFont = () => {
      if (focusedId === 'paper') return paper.font;
      
      const targetSticker = stickers.find(s => s.id === focusedId);
      if (targetSticker && targetSticker.type === 'text') return targetSticker.font || 'Caveat';
      
      const targetImage = images.find(img => img.id === focusedId);
      if (targetImage) return targetImage.font || 'Caveat';

      return paper.font || 'Caveat'; 
  };

   const getCurrentFontSize = () => {
      if (focusedId === 'paper') return paper.fontSize || 24;
      
      const targetSticker = stickers.find(s => s.id === focusedId);
      if (targetSticker) return targetSticker.fontSize || (targetSticker.type === 'emoji' ? 64 : 32);
      
      const targetImage = images.find(img => img.id === focusedId);
      if (targetImage) return targetImage.fontSize || 20;

      return paper.fontSize || 24; 
  };


  const handleExport = async () => {
    if (!appContainerRef.current) return;
    try {
        // --- 1. Font Embedding ---
        const fontEmbedCSS = await (async () => {
            try {
                const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@400;600&family=Shadows+Into+Light&family=Long+Cang&family=Ma+Shan+Zheng&family=Zhi+Mang+Xing&display=swap';
                const res = await fetch(GOOGLE_FONTS_URL);
                const css = await res.text();
                
                const urlRegex = /url\((['"]?)(.*?)\1\)/g;
                let newCss = css;
                const matches = [...css.matchAll(urlRegex)];
                
                await Promise.all(matches.map(async (match) => {
                    const originalUrlMatch = match[0];
                    const cleanUrl = match[2];
                    if (!cleanUrl.startsWith('http')) return; 

                    try {
                        const fontRes = await fetch(cleanUrl);
                        const blob = await fontRes.blob();
                        const reader = new FileReader();
                        await new Promise((resolve) => {
                            reader.onloadend = () => {
                                if (reader.result) {
                                    newCss = newCss.split(cleanUrl).join(reader.result as string);
                                }
                                resolve(null);
                            };
                            reader.readAsDataURL(blob);
                        });
                    } catch (err) {
                        console.warn('Failed to embed font url:', cleanUrl, err);
                    }
                }));
                return newCss;
            } catch (e) {
                console.warn('Failed to fetch font CSS', e);
                return undefined;
            }
        })();


        const node = appContainerRef.current;
        
        // --- 2. DOM Cloning & Preparation ---
        const clone = node.cloneNode(true) as HTMLElement;

        const focusedItems = clone.querySelectorAll('.focused-item');
        focusedItems.forEach(el => {
            el.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-4', 'ring-offset-transparent', 'border-blue-400', 'border-dashed', 'border', 'focused-item');
        });

        const toolPopups = clone.querySelectorAll('.tool-popup');
        toolPopups.forEach(popup => popup.remove());

        const links = clone.querySelectorAll('link');
        links.forEach(l => l.remove());

        const textareas = clone.querySelectorAll('textarea');
        textareas.forEach((textarea) => {
            const div = document.createElement('div');
            div.style.cssText = textarea.style.cssText;
            div.style.whiteSpace = 'pre-wrap';
            div.style.wordWrap = 'break-word';
            div.style.display = 'block';
            div.style.overflow = 'hidden'; 
            
            const computedStyle = window.getComputedStyle(textarea);
            div.style.fontFamily = textarea.style.fontFamily || computedStyle.fontFamily;
            div.style.fontSize = textarea.style.fontSize || computedStyle.fontSize;
            div.style.lineHeight = textarea.style.lineHeight || computedStyle.lineHeight;
            div.style.textAlign = textarea.style.textAlign || computedStyle.textAlign;
            div.style.color = textarea.style.color || computedStyle.color;

            div.textContent = textarea.value;
            div.className = textarea.className;
            textarea.replaceWith(div);
        });

        // --- 3. Robust Image Handling ---
        const imgElements = clone.querySelectorAll('img');
        await Promise.all(Array.from(imgElements).map(async (img) => {
             if (img.src.startsWith('data:')) return;
             
             try {
                const response = await fetch(img.src, { mode: 'cors' });
                const blob = await response.blob();
                
                await new Promise<void>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (reader.result) {
                            img.src = reader.result as string;
                            img.srcset = ''; 
                            resolve();
                        } else {
                            reject(new Error('Empty result from FileReader'));
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
             } catch (e) {
                 console.warn(`Failed to inline image: ${img.src}`, e);
             }
        }));


        // --- 4. Fix Blend Modes ---
        const shadowOverlays = clone.querySelectorAll('.shadow-overlay');
        shadowOverlays.forEach((el) => {
            const div = el as HTMLElement;
            div.style.mixBlendMode = 'normal';
            div.style.opacity = '0.3'; 
        });

        clone.style.position = 'fixed'; 
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.zIndex = '-9999';
        clone.style.width = `${node.offsetWidth}px`;
        clone.style.height = `${node.offsetHeight}px`;
        
        document.body.appendChild(clone);

        const dataUrl = await (window as any).htmlToImage.toPng(clone, {
            quality: 1.0,
            pixelRatio: 2,
            backgroundColor: '#181E23',
            fontEmbedCSS: fontEmbedCSS || undefined,
            skipAutoScale: true,
            cacheBust: false, 
            fetchRequestInit: {
                mode: 'cors',
            },
            filter: (domNode: any) => {
                if (domNode && domNode.tagName) {
                    return domNode.tagName !== 'LINK' && domNode.tagName !== 'SCRIPT';
                }
                return true;
            }
        });

        document.body.removeChild(clone);
      
        const link = document.createElement('a');
        link.download = `memory-board-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

    } catch (err: any) {
        console.error("Export failed detailed:", err);
        let msg = "Export failed. ";
        
        if (err instanceof Error) {
            msg += err.message;
        } else if (typeof err === 'object') {
            try {
                msg += JSON.stringify(err);
            } catch {
                msg += "Unknown error object.";
            }
        } else {
            msg += String(err);
        }
        alert(msg);
    }
  };

  return (
    <div 
      className="w-full h-full overflow-hidden flex flex-col md:flex-row items-center justify-center"
      style={{ backgroundColor: '#181E23' }} 
    >
      <div 
        ref={appContainerRef}
        className="w-full h-full flex md:flex-row flex-col-reverse relative overflow-hidden shadow-2xl"
        style={{ 
            backgroundColor: COLORS.FRAME,
            borderWidth: isMobile ? '8px' : '16px',
            borderColor: COLORS.FRAME,
        }}
      >
        <Sidebar 
          activeTool={activeTool} 
          setActiveTool={setActiveTool}
          onAddImage={handleAddImage}
          onAddSticker={handleAddSticker}
          onExport={handleExport}
          onToggleShadow={() => setShadowEnabled(!shadowEnabled)}
          paperColor={paper.color}
          setPaperColor={(c: string) => setPaper(p => ({...p, color: c}))}
          onChangeFont={handleFontChange}
          onChangeFontSize={handleFontSizeChange}
          currentFont={getCurrentFont()}
          currentFontSize={getCurrentFontSize()}
          setBgColor={setBgColor}
          shadowEnabled={shadowEnabled}
          setPaper={setPaper}
        />

        <div 
          ref={canvasRef}
          className="flex-1 w-full h-full relative overflow-hidden transition-colors duration-500 touch-none"
          style={{ 
              backgroundColor: bgColor,
              border: isMobile ? '8px solid #4A6D7C' : '24px solid #4A6D7C', 
              boxShadow: 'inset 0 0 20px 5px rgba(0,0,0,0.4), inset 0 0 50px 10px rgba(0,0,0,0.1)'
          }}
          onClick={() => { setActiveTool('NONE'); setFocusedId('paper'); }}
        >
          {shadowEnabled && (
             <div className="absolute -inset-40 z-[5000] pointer-events-none shadow-overlay" 
                  style={{
                      background: 'repeating-linear-gradient(110deg, rgba(20, 20, 30, 0.15) 0%, rgba(20, 20, 30, 0.15) 160px, transparent 160px, transparent 320px)',
                      filter: 'blur(30px)',
                      mixBlendMode: 'multiply'
                  }}
             />
          )}

           <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-[4900]"></div>

          <LetterPaper 
            state={paper} 
            setState={setPaper} 
            zIndex={1} 
            onFocus={() => bringToFront('paper')}
            containerSize={containerDimensions}
          />

          {images.map(img => (
            <PhotoItem 
              key={img.id} 
              image={img} 
              updateImage={updateImage} 
              onRemove={removeImage}
              onFocus={() => bringToFront(img.id)}
              isFocused={focusedId === img.id}
              containerSize={containerDimensions}
            />
          ))}

          {stickers.map(sticker => (
              <StickerComponent
                key={sticker.id}
                sticker={sticker}
                updateSticker={updateSticker}
                onRemove={removeSticker}
                onFocus={() => bringToFront(sticker.id)}
                isFocused={focusedId === sticker.id}
                onToggleFont={() => cycleFont(sticker.id)}
                containerSize={containerDimensions}
              />
          ))}

        </div>
      </div>
    </div>
  );
}