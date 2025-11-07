import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'edaay_shopping_lists'

export const useShoppingStore = defineStore('shopping', () => {
  const lists = ref([])
  const activeListId = ref(null)

  // Getters
  const activeList = computed(() => lists.value.find(l => l.id === activeListId.value))
  const allLists = computed(() => lists.value)
  
  const getListById = (id) => lists.value.find(l => l.id === id)

  // Hydrate
  const hydrate = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        lists.value = data.lists || []
        activeListId.value = data.activeListId || null
      }
    } catch (e) {
      console.error('Failed to load shopping lists:', e)
    }
  }

  // Persist
  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      lists: lists.value,
      activeListId: activeListId.value
    }))
  }

  // Actions
  const createList = (name, items = []) => {
    const newList = {
      id: Date.now(),
      name,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    lists.value.push(newList)
    persist()
    return newList
  }

  const updateList = (id, updates) => {
    const index = lists.value.findIndex(l => l.id === id)
    if (index !== -1) {
      lists.value[index] = {
        ...lists.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      persist()
    }
  }

  const deleteList = (id) => {
    lists.value = lists.value.filter(l => l.id !== id)
    if (activeListId.value === id) {
      activeListId.value = null
    }
    persist()
  }

  const setActiveList = (id) => {
    activeListId.value = id
    persist()
  }

  const updateListItems = (id, items) => {
    const list = lists.value.find(l => l.id === id)
    if (list) {
      list.items = items
      list.updatedAt = new Date().toISOString()
      persist()
    }
  }

  // Init
  hydrate()

  return {
    lists,
    activeListId,
    activeList,
    allLists,
    getListById,
    createList,
    updateList,
    deleteList,
    setActiveList,
    updateListItems,
    hydrate,
    persist
  }
})
