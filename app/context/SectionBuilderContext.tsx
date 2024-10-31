'use client'

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react'

type ElementType = 'layout' | 'color'

interface TreeNode {
  id: string
  name: string
  tagName: string
  children: TreeNode[]
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
  updateNodeTree: (parentId: string, newNode: TreeNode) => void
  renameNode: (nodeId: string, newName: string, newTagName: string) => void
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void
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
  const [nodeTree, setNodeTree] = useState<TreeNode[]>([
    { id: 'root', name: 'Root', tagName: 'div', children: [] }
  ])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

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
      console.log('Options updated:', newOptions) // Debugging log
      return newOptions
    })
  }, [])

  const updateNodeTree = useCallback((parentId: string, newNode: TreeNode) => {
    setNodeTree(prevTree => {
      const updateChildren = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) {
            return { ...node, children: [...node.children, newNode] }
          } else if (node.children.length > 0) {
            return { ...node, children: updateChildren(node.children) }
          }
          return node
        })
      }
      return updateChildren(prevTree)
    })
  }, [])

  const renameNode = useCallback((nodeId: string, newName: string, newTagName: string) => {
    setNodeTree(prevTree => {
      const updateNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            return { ...node, name: newName, tagName: newTagName }
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
        selectedNodeId,
        setSelectedNodeId,
      }}
    >
      {children}
    </SectionBuilderContext.Provider>
  )
}