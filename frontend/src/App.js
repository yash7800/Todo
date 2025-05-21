import { useEffect, useState } from 'react';
import TodoList from './TodoList';
import './styles.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setMessage('Failed to load todos. Please try again.');
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) {
      setMessage('Todo text cannot be empty');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTodo })
      });
      
      if (!response.ok) throw new Error('Failed to add todo');
      
      const data = await response.json();
      setTodos([...todos, data]);
      setNewTodo('');
      setMessage('Todo added successfully!');
    } catch (error) {
      console.error('Error adding todo:', error);
      setMessage(error.message || 'Failed to add todo');
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) throw new Error('Failed to delete todo');
      
      setTodos(todos.filter(todo => todo.id !== id));
      setMessage('Todo deleted successfully!');
    } catch (error) {
      console.error('Error deleting todo:', error);
      setMessage(error.message || 'Failed to delete todo');
    }
  };

  const summarizeTodos = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }
      
      const data = await response.json();
      setMessage(data.success ? 'Summary sent to Slack successfully!' : data.error);
    } catch (error) {
      console.error('Error summarizing todos:', error);
      setMessage(error.message || 'Failed to send summary to Slack');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') addTodo();
  };

  return (
    <div className="app">
      <h1>Todo Summary Assistant</h1>
      <div className="input-container">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => {
            setNewTodo(e.target.value);
            setMessage('');
          }}
          onKeyPress={handleKeyPress}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      
      <TodoList todos={todos} onDelete={deleteTodo} />
      
      <button 
        className="summarize-btn" 
        onClick={summarizeTodos}
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Summarize and Send to Slack'}
      </button>
      
      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App;