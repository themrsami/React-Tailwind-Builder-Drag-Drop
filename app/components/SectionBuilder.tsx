'use client'

import { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { ElementSelector } from './ElementSelector'
import { OptionSelector } from './OptionSelector'
import PreviewAndCode from './PreviewAndCode'
import { useSectionBuilder } from '../context/SectionBuilderContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SectionBuilder() {
  const { componentName, setComponentName, currentReactCode, currentHtmlCode } = useSectionBuilder()
  const [activeTab, setActiveTab] = useState<'preview' | 'react-code' | 'html-code' | 'tree'>('preview')
  const [fileName, setFileName] = useState(componentName)
  const [fileExtension, setFileExtension] = useState('tsx')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSave = () => {
    const content = activeTab === 'react-code' ? currentReactCode : currentHtmlCode
    const fullFileName = `${fileName}.${fileExtension}`
    downloadFile(fullFileName, content)
    setIsDialogOpen(false)
  }

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a')
    const file = new Blob([content], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getFileExtensions = () => {
    switch (activeTab) {
      case 'react-code':
        return ['jsx', 'tsx']
      case 'html-code':
        return ['html']
      default:
        return ['txt']
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Card className="rounded-none border-b">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Label htmlFor="componentName" className="text-lg font-semibold">
              Component Name:
            </Label>
            <Input
              id="componentName"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              className="w-64"
              placeholder="Enter component name"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Save className="mr-2 h-4 w-4" />
                Save Component
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Component</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fileName" className="text-right">
                    File Name
                  </Label>
                  <Input
                    id="fileName"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fileExtension" className="text-right">
                    File Extension
                  </Label>
                  <Select
                    value={fileExtension}
                    onValueChange={setFileExtension}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select file extension" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFileExtensions().map((ext) => (
                        <SelectItem key={ext} value={ext}>{ext}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSave}>Save</Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel defaultSize={20} minSize={15}>
          <Card className="h-full rounded-none border-r">
            <CardHeader>
              <CardTitle>Elements</CardTitle>
            </CardHeader>
            <CardContent>
              <ElementSelector />
            </CardContent>
          </Card>
        </Panel>
        <PanelResizeHandle className="w-1 bg-border hover:bg-border/50 transition-colors" />
        <Panel defaultSize={30} minSize={20}>
          <Card className="h-full rounded-none border-r">
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent>
              <OptionSelector />
            </CardContent>
          </Card>
        </Panel>
        <PanelResizeHandle className="w-1 bg-border hover:bg-border/50 transition-colors" />
        <Panel defaultSize={50} minSize={30}>
          <Card className="h-full rounded-none flex flex-col">
            <CardHeader>
              <CardTitle>Preview & Code</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-hidden">
              <PreviewAndCode onTabChange={setActiveTab} />
            </CardContent>
          </Card>
        </Panel>
      </PanelGroup>
    </div>
  )
}