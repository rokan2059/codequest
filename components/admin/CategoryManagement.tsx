import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const CategoryManagement: React.FC = () => {
    const { state, dispatch, addToast, addCategory, editCategory, deleteCategory } = useAppContext();
    const { puzzles } = state;

    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim() === '') {
            addToast('Category name cannot be empty.', 'error');
            return;
        }
        if (puzzles[newCategory.trim()]) {
            addToast('Category already exists.', 'error');
            return;
        }
        addCategory(newCategory.trim());
        addToast(`Category "${newCategory.trim()}" added.`, 'success');
        setNewCategory('');
    };

    const handleDeleteCategory = (categoryName: string) => {
        if (window.confirm(`Are you sure you want to delete the "${categoryName}" category and all its puzzles? This cannot be undone.`)) {
            deleteCategory(categoryName);
            addToast(`Category "${categoryName}" deleted.`, 'success');
        }
    };
    
    const handleStartEdit = (categoryName: string) => {
        setEditingCategory({ oldName: categoryName, newName: categoryName });
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
    };

    const handleSaveEdit = () => {
        if (!editingCategory) return;
        
        const { oldName, newName } = editingCategory;
        if (newName.trim() === '') {
            addToast('Category name cannot be empty.', 'error');
            return;
        }
        if (newName.trim() !== oldName && puzzles[newName.trim()]) {
            addToast('A category with that name already exists.', 'error');
            return;
        }

        editCategory(oldName, newName.trim());
        addToast(`Category renamed to "${newName.trim()}".`, 'success');
        setEditingCategory(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-slate-900 text-white p-4 sm:p-6 lg:p-8 fade-in">
            <header className="flex items-center mb-8">
                <button onClick={() => dispatch({ type: 'SET_ADMIN_VIEW', payload: 'main' })} className="mr-4 text-blue-400 hover:text-blue-300 transition-colors">
                    &larr; Back
                </button>
                <h1 className="text-3xl font-bold text-gray-100">Category Management</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add New Category Form */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 self-start">
                    <h2 className="text-2xl font-semibold mb-4">Add New Category</h2>
                    <form onSubmit={handleAddCategory} className="flex gap-2">
                        <input
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New category name"
                            className="flex-grow p-2 bg-gray-900 border border-gray-700 rounded"
                            required
                        />
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Add
                        </button>
                    </form>
                </div>

                {/* Existing Categories List */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 max-h-[80vh] overflow-y-auto">
                    <h2 className="text-2xl font-semibold mb-4">Existing Categories</h2>
                    <ul className="space-y-3">
                        {Object.keys(puzzles).map((category) => (
                            <li key={category} className="p-3 bg-gray-900/50 rounded border border-gray-700 flex items-center justify-between">
                                {editingCategory?.oldName === category ? (
                                    <input
                                        value={editingCategory.newName}
                                        onChange={(e) => editingCategory && setEditingCategory({ ...editingCategory, newName: e.target.value })}
                                        className="flex-grow p-1 bg-gray-700 border border-gray-600 rounded mr-2"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="font-medium">{category} ({puzzles[category].length} puzzles)</span>
                                )}
                                
                                <div className="flex gap-2">
                                {editingCategory?.oldName === category ? (
                                    <>
                                        <button onClick={handleSaveEdit} className="text-green-400 hover:text-green-300">Save</button>
                                        <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-300">Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleStartEdit(category)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                        <button onClick={() => handleDeleteCategory(category)} className="text-red-400 hover:text-red-300">Delete</button>
                                    </>
                                )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagement;