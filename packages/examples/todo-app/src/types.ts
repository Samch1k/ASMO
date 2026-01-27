export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

export interface TodoStore {
  todos: Todo[]
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  clearCompleted: () => void
}
