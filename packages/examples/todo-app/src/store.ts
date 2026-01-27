import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TodoStore } from './types'

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],

      addTodo: (text: string) =>
        set((state) => ({
          todos: [
            ...state.todos,
            {
              id: crypto.randomUUID(),
              text,
              completed: false,
              createdAt: Date.now(),
            },
          ],
        })),

      toggleTodo: (id: string) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        })),

      deleteTodo: (id: string) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),

      clearCompleted: () =>
        set((state) => ({
          todos: state.todos.filter((todo) => !todo.completed),
        })),
    }),
    {
      name: 'todo-storage',
    }
  )
)
