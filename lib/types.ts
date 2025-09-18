export interface CSVRow {
  id: string
  psNumber: string
  title: string
  description: string
  organisation: string
  theme: string
  rowNumber: number
}

export interface ColumnMapping {
  psNumber: string
  title: string
  description: string
  organisation: string
  theme: string
}

export interface AppState {
  csvData: CSVRow[]
  columnMapping: ColumnMapping
  currentIndex: number
  acceptedItems: CSVRow[]
  doableItems: CSVRow[]
  rejectedItems: CSVRow[]
}

export type ReviewAction = "accept" | "doable" | "reject"
