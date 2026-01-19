import React, { useState } from 'react';
import { Calendar, Flag, Hash, MoreHorizontal } from 'lucide-react';

const TaskInput = ({ onAdd, onCancel, initialData = null, isEditing = false }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [priority, setPriority] = useState(initialData?.priority || 'medium');
    const [dueDate, setDueDate] = useState(initialData?.dueDate || '');

    const handleAdd = () => {
        if (!title.trim()) return;
        onAdd({ title, description, priority, dueDate: dueDate || 'Today' });
        if (!isEditing) {
            setTitle('');
            setDescription('');
            setPriority('medium');
            setDueDate('');
        }
    };

    return (
        <div className="task-input-box" style={isEditing ? { marginBottom: 0, border: '1px solid var(--color-primary)', boxShadow: '0 0 0 2px rgba(217, 85, 64, 0.1)' } : {}}>
            <input
                type="text"
                className="input-title"
                placeholder="Task name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                autoFocus
            />
            <input
                type="text"
                className="input-desc"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <div className="input-tools-row">
                <div className="tool-chip" style={{ position: 'relative' }}>
                    <Calendar size={14} />
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        style={{ border: 'none', background: 'transparent', width: '90px', fontSize: '0.8rem', outline: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                    />
                </div>

                <div className="tool-chip">
                    <Flag size={14} />
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'capitalize', cursor: 'pointer' }}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                {/* <button className="tool-button-icon">
                    <MoreHorizontal size={16} />
                </button> */}
            </div>

            <div className="input-footer">
                <div className="project-selector">
                    <Hash size={14} color="#888" />
                    <span>My Tasks</span>
                </div>
                <div className="footer-actions">
                    <button className="btn-cancel" onClick={() => {
                        if (onCancel) {
                            onCancel();
                        } else {
                            setTitle('');
                            setDescription('');
                        }
                    }}>Cancel</button>
                    <button className="btn-add-task" onClick={handleAdd}>
                        {isEditing ? 'Save' : 'Add task'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskInput;
