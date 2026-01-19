import React, { useState } from 'react';
import { Check, Calendar, Flag, Trash2, RotateCcw, Pen } from 'lucide-react';
import TaskInput from './TaskInput';

const getPriorityBg = (p) => {
    if (p === 'high') return 'rgba(217, 83, 79, 0.1)';
    if (p === 'medium') return 'rgba(240, 173, 78, 0.1)';
    return 'rgba(91, 192, 222, 0.1)';
};

const getPriorityColor = (p) => {
    if (p === 'high') return '#d9534f';
    if (p === 'medium') return '#f0ad4e';
    return '#5bc0de';
};

const TaskCard = ({ task, onToggle, onDelete, onRestore, onEdit, isTrash }) => {
    return (
        <div className="task-card">
            {!isTrash && (
                <div className="task-checkbox-container">
                    <div
                        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                        onClick={() => onToggle(task._id)}
                    >
                        {task.completed && <Check size={12} strokeWidth={4} />}
                    </div>
                </div>
            )}
            <div className="task-content">
                <div className={`task-title ${task.completed ? 'completed' : ''}`}>
                    {task.title}
                </div>
                {task.description && <div className="task-description">{task.description}</div>}
            </div>

            <div className="task-meta">
                {!isTrash && task.priority && (
                    <div className="priority-tag" style={{ color: getPriorityColor(task.priority), backgroundColor: getPriorityBg(task.priority) }}>
                        {task.priority}
                    </div>
                )}

                {task.dueDate && (
                    <div className="date-tag">
                        <span>{task.dueDate}</span>
                    </div>
                )}

                {isTrash ? (
                    <button onClick={() => onRestore(task._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-success)', padding: '4px' }}>
                        <RotateCcw size={16} />
                    </button>
                ) : (
                    <>
                        <button onClick={() => onEdit(task._id)} className="delete-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '4px' }}>
                            <Pen size={16} />
                        </button>
                        <button onClick={() => onDelete(task._id)} className="delete-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const TaskList = ({ tasks, onToggleTask, onDeleteTask, onRestoreTask, onEditTask, isTrash = false }) => {
    const [editingId, setEditingId] = useState(null);

    if (!tasks || tasks.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                {isTrash ? "Trash is empty." : "No tasks found. Enjoy your day!"}
            </div>
        );
    }

    const handleUpdate = (id, data) => {
        onEditTask(id, data);
        setEditingId(null);
    };

    return (
        <div className="task-list">
            {tasks.map(task => (
                editingId === task._id ? (
                    <TaskInput
                        key={task._id}
                        initialData={task}
                        isEditing={true}
                        onAdd={(data) => handleUpdate(task._id, data)}
                        onCancel={() => setEditingId(null)}
                    />
                ) : (
                    <TaskCard
                        key={task._id}
                        task={task}
                        onToggle={onToggleTask}
                        onDelete={onDeleteTask}
                        onRestore={onRestoreTask}
                        onEdit={() => setEditingId(task._id)}
                        isTrash={isTrash}
                    />
                )
            ))}
        </div>
    );
};

export default TaskList;
