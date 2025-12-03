"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (value: any, row: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchKey?: keyof T
  searchPlaceholder?: string
  actions?: (row: T) => React.ReactNode
  onRowClick?: (row: T) => void
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Buscar...",
  actions,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState("")

  const filteredData = React.useMemo(() => {
    if (!search || !searchKey) return data
    return data.filter((item) => {
      const value = item[searchKey]
      return String(value).toLowerCase().includes(search.toLowerCase())
    })
  }, [data, search, searchKey])

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}
      <div className="rounded-lg border border-gray-200 dark:border-gray-900 overflow-hidden bg-white dark:bg-black">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={String(column.key)} className="whitespace-nowrap">{column.header}</TableHead>
                ))}
                {actions && <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="h-24 text-center"
                  >
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow 
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  >
                    {columns.map((column) => (
                      <TableCell key={String(column.key)} className="whitespace-nowrap">
                        {column.render
                          ? column.render((row as any)[column.key], row)
                          : String((row as any)[column.key] ?? "")}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell className="text-right whitespace-nowrap max-w-[200px] sm:max-w-none" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 sm:gap-2 flex-wrap">
                          {actions(row)}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron resultados.
            </div>
          ) : (
            filteredData.map((row) => (
              <div 
                key={row.id} 
                className={`border rounded-lg p-4 space-y-3 bg-card ${onRowClick ? "cursor-pointer hover:bg-accent transition-colors" : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <div key={String(column.key)} className="flex justify-between items-start gap-2">
                    <span className="text-sm font-medium text-muted-foreground min-w-[100px]">
                      {column.header}:
                    </span>
                    <span className="text-sm text-right flex-1 break-words">
                      {column.render
                        ? column.render((row as any)[column.key], row)
                        : String((row as any)[column.key] ?? "")}
                    </span>
                  </div>
                ))}
                {actions && (
                  <div className="flex items-center justify-end gap-1 sm:gap-2 pt-2 border-t flex-wrap" onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

