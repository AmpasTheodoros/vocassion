'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IkigaiMapProps {
  data: {
    passion: string[];
    mission: string[];
    profession: string[];
    vocation: string[];
  };
}

export function IkigaiMap({ data }: IkigaiMapProps) {
  return (
    <Card className="p-6 w-full max-w-3xl mx-auto">
      <div className="relative w-full aspect-square">
        {/* Main circles container */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Passion Circle (What you love) */}
          <div className="absolute w-2/3 h-2/3 rounded-full bg-red-200/50 transform -translate-x-1/4 -translate-y-1/4 flex items-center justify-center group">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-red-700 font-semibold z-10">What you love</span>
            </div>
            <ScrollArea className="h-32 w-32 rounded-md border p-2 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-2">
                {data.passion.map((item, index) => (
                  <div key={index} className="text-sm text-red-700 mb-1">{item}</div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Mission Circle (What the world needs) */}
          <div className="absolute w-2/3 h-2/3 rounded-full bg-green-200/50 transform translate-x-1/4 -translate-y-1/4 flex items-center justify-center group">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-green-700 font-semibold z-10">What the world needs</span>
            </div>
            <ScrollArea className="h-32 w-32 rounded-md border p-2 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-2">
                {data.mission.map((item, index) => (
                  <div key={index} className="text-sm text-green-700 mb-1">{item}</div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Profession Circle (What you can be paid for) */}
          <div className="absolute w-2/3 h-2/3 rounded-full bg-yellow-200/50 transform translate-x-1/4 translate-y-1/4 flex items-center justify-center group">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-yellow-700 font-semibold z-10">What you can be paid for</span>
            </div>
            <ScrollArea className="h-32 w-32 rounded-md border p-2 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-2">
                {data.vocation.map((item, index) => (
                  <div key={index} className="text-sm text-yellow-700 mb-1">{item}</div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Vocation Circle (What you're good at) */}
          <div className="absolute w-2/3 h-2/3 rounded-full bg-blue-200/50 transform -translate-x-1/4 translate-y-1/4 flex items-center justify-center group">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-700 font-semibold z-10">What you're good at</span>
            </div>
            <ScrollArea className="h-32 w-32 rounded-md border p-2 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-2">
                {data.profession.map((item, index) => (
                  <div key={index} className="text-sm text-blue-700 mb-1">{item}</div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Center text - Ikigai */}
          <div className="absolute z-10 bg-white/90 p-4 rounded-full shadow-lg">
            <span className="text-lg font-bold text-gray-800">IKIGAI</span>
          </div>
        </div>
        
        {/* Intersection labels */}
        <div className="absolute inset-0">
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-sm text-purple-700">
            Delight & Fullfilment
          </div>
          <div className="absolute top-1/2 left-[15%] -translate-y-1/2 text-sm text-indigo-700">
            Comfortable & Satisfied
          </div>
          <div className="absolute top-1/2 right-[15%] -translate-y-1/2 text-sm text-orange-700">
            Excited & Rewarded
          </div>
          <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 text-sm text-teal-700">
            Useful & Rewarded
          </div>
        </div>
      </div>
    </Card>
  );
}

