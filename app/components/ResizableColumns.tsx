'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { GripVertical } from 'lucide-react'

interface Column {
  content: React.ReactNode
  minWidth: number
}

interface ResizableColumnsProps {
  columns: Column[]
}

export const ResizableColumns: React.FC<ResizableColumnsProps> = ({ columns }) => {
  const [columnWidths, setColumnWidths] = useState<number[]>(
    columns.map(() => 100 / columns.length)
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef<boolean>(false)
  const dragIndex = useRef<number>(-1)

  const handleMouseDown = useCallback((index: number) => {
    isDragging.current = true
    dragIndex.current = index
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const mouseX = e.clientX - containerRef.current.getBoundingClientRect().left
      const percentage = (mouseX / containerWidth) * 100

      setColumnWidths((prevWidths) => {
        const newWidths = [...prevWidths]
        const minWidth = (columns[dragIndex.current].minWidth / containerWidth) * 100
        const maxWidth = 100 - prevWidths.reduce((sum, width, i) => (i === dragIndex.current ? sum : sum + width), 0)

        newWidths[dragIndex.current] = Math.max(minWidth, Math.min(percentage, maxWidth))
        newWidths[dragIndex.current + 1] = 100 - newWidths.reduce((sum, width) => sum + width, 0)

        return newWidths
      })
    },
    [columns]
  )

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    dragIndex.current = -1
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div ref={containerRef} className="flex h-[calc(100vh-8rem)] overflow-hidden">
      {columns.map((column, index) => (
        <React.Fragment key={index}>
          <div className="overflow-auto" style={{ width: `${columnWidths[index]}%` }}>
            {column.content}
          </div>
          {index < columns.length - 1 && (
            <div
              className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex items-center justify-center"
              onMouseDown={() => handleMouseDown(index)}
            >
              <GripVertical className="text-gray-400" size={16} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}