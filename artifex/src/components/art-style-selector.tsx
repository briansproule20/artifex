'use client';

import { artStyles, type ArtStyle } from '@/lib/art-styles';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ArtStyleSelectorProps {
  onStyleSelect: (style: ArtStyle) => void;
  selectedStyleId?: string;
}

export function ArtStyleSelector({ onStyleSelect, selectedStyleId }: ArtStyleSelectorProps) {
  const selectedStyle = artStyles.find(s => s.id === selectedStyleId);

  return (
    <Select value={selectedStyleId} onValueChange={(id) => {
      const style = artStyles.find(s => s.id === id);
      if (style) onStyleSelect(style);
    }}>
      <SelectTrigger className="w-full h-9 border-[#4A4E69] bg-[#2a2a45] text-[#F2E9E4] text-sm">
        <SelectValue placeholder="Select art style (optional)">
          {selectedStyle ? selectedStyle.name : 'Select art style (optional)'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-[#2a2a45] border-[#4A4E69] max-h-[400px]">
        <SelectItem value="none" className="text-[#9A8C98] hover:bg-[#4A4E69] hover:text-[#F2E9E4] text-sm">
          No style
        </SelectItem>

        {/* Historical */}
        <div className="px-2 py-1.5 text-xs font-semibold text-[#9A8C98] uppercase tracking-wider">Historical</div>
        {artStyles.filter(s => s.category === 'historical').map(style => (
          <SelectItem
            key={style.id}
            value={style.id}
            className="text-[#F2E9E4] hover:bg-[#4A4E69] text-sm pl-4"
          >
            {style.name}
          </SelectItem>
        ))}

        {/* Modern */}
        <div className="px-2 py-1.5 text-xs font-semibold text-[#9A8C98] uppercase tracking-wider mt-2">Modern</div>
        {artStyles.filter(s => s.category === 'modern').map(style => (
          <SelectItem
            key={style.id}
            value={style.id}
            className="text-[#F2E9E4] hover:bg-[#4A4E69] text-sm pl-4"
          >
            {style.name}
          </SelectItem>
        ))}

        {/* Digital */}
        <div className="px-2 py-1.5 text-xs font-semibold text-[#9A8C98] uppercase tracking-wider mt-2">Digital</div>
        {artStyles.filter(s => s.category === 'digital').map(style => (
          <SelectItem
            key={style.id}
            value={style.id}
            className="text-[#F2E9E4] hover:bg-[#4A4E69] text-sm pl-4"
          >
            {style.name}
          </SelectItem>
        ))}

        {/* Photography */}
        <div className="px-2 py-1.5 text-xs font-semibold text-[#9A8C98] uppercase tracking-wider mt-2">Photography</div>
        {artStyles.filter(s => s.category === 'photography').map(style => (
          <SelectItem
            key={style.id}
            value={style.id}
            className="text-[#F2E9E4] hover:bg-[#4A4E69] text-sm pl-4"
          >
            {style.name}
          </SelectItem>
        ))}

        {/* Illustration */}
        <div className="px-2 py-1.5 text-xs font-semibold text-[#9A8C98] uppercase tracking-wider mt-2">Illustration</div>
        {artStyles.filter(s => s.category === 'illustration').map(style => (
          <SelectItem
            key={style.id}
            value={style.id}
            className="text-[#F2E9E4] hover:bg-[#4A4E69] text-sm pl-4"
          >
            {style.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
