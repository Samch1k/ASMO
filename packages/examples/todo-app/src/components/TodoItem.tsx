import type { Todo } from '../types'
import { useTodoStore } from '../store'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, deleteTodo } = useTodoStore()

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
      />
      <span
        className={`flex-1 text-gray-900 ${
          todo.completed ? 'line-through text-gray-500' : ''
        }`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
        aria-label="Delete todo"
      >
        Delete
      </button>
    </div>
  )
}
