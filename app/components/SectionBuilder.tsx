'use client'

import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { ElementSelector } from './ElementSelector'
import { OptionSelector } from './OptionSelector'
import PreviewAndCode from './PreviewAndCode'
import { useSectionBuilder } from '../context/SectionBuilderContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NodeTree } from './NodeTree'

export default function SectionBuilder() {
  const { componentName, setComponentName } = useSectionBuilder()

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4">
        <Label htmlFor="componentName">Component Name</Label>
        <Input
          id="componentName"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
          className="mt-1"
        />
      </div>
      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel defaultSize={20} minSize={15}>
          <ElementSelector />
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
        <Panel defaultSize={30} minSize={20}>
          <OptionSelector />
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
        <Panel defaultSize={50} minSize={30}>
          <PreviewAndCode />
        </Panel>
      </PanelGroup>
    </div>
  )
}