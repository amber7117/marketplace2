'use client';
import * as React from 'react';
import { Button } from './Button';

export function GradientButtonTest() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Gradient Button Test</h2>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Red to Yellow Gradient Button</h3>
        <Button variant="gradient" size="lg">
          Red to Yellow
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Other Button Variants for Comparison</h3>
        <div className="flex gap-2">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      </div>
    </div>
  );
}
