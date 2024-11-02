'use client'

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react'

type ElementType = 'layout' | 'color'

interface TreeNode {
  id: string
  name: string
  tagName: string
  children: TreeNode[]
  text?: string
}

interface SectionBuilderContextType {
  selectedElement: ElementType | null
  setSelectedElement: (element: ElementType | null) => void
  options: Record<string, Record<string, string>>
  setOptions: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>
  updateOption: (nodeId: string, key: string, value: string) => void
  componentName: string
  setComponentName: (name: string) => void
  nodeTree: TreeNode[]
  updateNodeTree: (updater: (prevTree: TreeNode[]) => TreeNode[]) => void
  renameNode: (nodeId: string, newName: string, newTagName: string, newText?: string) => void
  selectedNodes: string[]
  setSelectedNodes: React.Dispatch<React.SetStateAction<string[]>>
  currentReactCode: string
  
  setCurrentReactCode: (code: string) => void
  currentHtmlCode: string
  setCurrentHtmlCode: (code: string) => void
}

const SectionBuilderContext = createContext<SectionBuilderContextType | undefined>(undefined)

export const useSectionBuilder = () => {
  const context = useContext(SectionBuilderContext)
  if (!context) {
    throw new Error('useSectionBuilder must be used within a SectionBuilderProvider')
  }
  return context
}

export const SectionBuilderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null)
  const [options, setOptions] = useState<Record<string, Record<string, string>>>({})
  const [componentName, setComponentName] = useState<string>('MySection')
  const [nodeTree, setNodeTree] = useState<TreeNode[]>([])
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [currentReactCode, setCurrentReactCode] = useState('')
  const [currentHtmlCode, setCurrentHtmlCode] = useState('')

  const updateOption = useCallback((nodeId: string, key: string, value: string) => {
    setOptions(prevOptions => {
      const newOptions = { ...prevOptions }
      if (!newOptions[nodeId]) {
        newOptions[nodeId] = {}
      }
      if (value) {
        newOptions[nodeId][key] = value
      } else {
        delete newOptions[nodeId][key]
      }
      return newOptions
    })
  }, [])

  const updateNodeTree = useCallback((updater: (prevTree: TreeNode[]) => TreeNode[]) => {
    setNodeTree(updater)
  }, [])

  const renameNode = useCallback((nodeId: string, newName: string, newTagName: string, newText?: string) => {
    setNodeTree(prevTree => {
      const updateNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            return { ...node, name: newName, tagName: newTagName, text: newText }
          } else if (node.children.length > 0) {
            return { ...node, children: updateNode(node.children) }
          }
          return node
        })
      }
      return updateNode(prevTree)
    })
  }, [])

  return (
    <SectionBuilderContext.Provider
      value={{
        selectedElement,
        setSelectedElement,
        options,
        setOptions,
        updateOption,
        componentName,
        setComponentName,
        nodeTree,
        updateNodeTree,
        renameNode,
        selectedNodes,
        setSelectedNodes,
        currentReactCode,
        setCurrentReactCode,
        currentHtmlCode,
        setCurrentHtmlCode,
      }}
    >
      {children}
    </SectionBuilderContext.Provider>
  )
}