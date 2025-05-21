import PropTypes from 'prop-types';

const TodoList = ({ todos, onDelete }) => {
  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <li key={todo.id} className="todo-item">
          <span>{todo.text}</span>
          <button 
            onClick={() => onDelete(todo.id)}
            className="delete-btn"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired
    })
  ).isRequired,
  onDelete: PropTypes.func.isRequired
};

export default TodoList;