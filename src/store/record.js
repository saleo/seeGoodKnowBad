import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'

export const useRecordStore = defineStore('record', {
  state: () => ({
    records: storage.get('records') || []
  }),
  
  actions: {
    addRecord(record) {
      const newRecord = {
        id: Date.now(),
        time: Date.now(),
        ...record
      }
      
      this.records.unshift(newRecord)
      this.saveToStorage()
    },
    
    clearAll() {
      this.records = []
      this.saveToStorage()
    },
    
    saveToStorage() {
      storage.set('records', this.records)
    },
    
    loadRecords() {
      const stored = storage.get('records')
      if (stored) {
        this.records = stored
      }
    }
  }
})
