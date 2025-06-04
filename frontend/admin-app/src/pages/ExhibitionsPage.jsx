import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // Our configured axios instance

// Placeholder for a modal component, you might use a library or build a simple one
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center" id="my-modal">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          {children}
          <div className="items-center px-4 py-3">
            <button
              id="ok-btn"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ExhibitionForm component (can be in a separate file later)
const ExhibitionForm = ({ exhibition, onSave, onCancel }) => {
  const [title, setTitle] = useState(exhibition ? exhibition.title : '');
  const [description, setDescription] = useState(exhibition ? exhibition.description : '');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    try {
      await onSave({ ...exhibition, title, description });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exhibition.');
      console.error("Save exhibition error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold">{exhibition ? 'Edit' : 'Create'} Exhibition</h3>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
        >
          Save Exhibition
        </button>
      </div>
    </form>
  );
};


function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState(null); // null for new, object for edit

  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState(null);
  const [currentExhibitionTitle, setCurrentExhibitionTitle] = useState('');


  const fetchExhibitions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/exhibitions');
      setExhibitions(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch exhibitions.');
      console.error("Fetch exhibitions error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExhibitions();
  }, [fetchExhibitions]);

  const handleOpenModal = (exhibition = null) => {
    setEditingExhibition(exhibition);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExhibition(null);
  };

  const handleSaveExhibition = async (exhibitionData) => {
    if (editingExhibition && editingExhibition.id) { // Editing existing
      await api.put(`/exhibitions/${editingExhibition.id}`, exhibitionData);
    } else { // Creating new
      await api.post('/exhibitions', exhibitionData);
    }
    fetchExhibitions(); // Refresh list
    handleCloseModal();
  };

  const handleDeleteExhibition = async (exhibitionId) => {
    if (window.confirm('Are you sure you want to delete this exhibition and all its stations?')) {
      try {
        await api.delete(`/exhibitions/${exhibitionId}`);
        fetchExhibitions(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete exhibition.');
        console.error("Delete exhibition error:", err);
      }
    }
  };

  const handleShowQrCode = async (exhibition) => {
    try {
      const response = await api.get(`/exhibitions/${exhibition.id}/qrcode`);
      setCurrentQrCode(response.data.qrCodeDataUrl);
      setCurrentExhibitionTitle(exhibition.title);
      setQrCodeModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch QR code.');
      console.error("Fetch QR code error:", err);
    }
  };


  if (loading) return <div className="p-4 text-center">Loading exhibitions...</div>;
  if (error && exhibitions.length === 0) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Exhibitions</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          + Create Exhibition
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {exhibitions.length === 0 && !loading && (
        <p className="text-center text-gray-600">No exhibitions found. Get started by creating one!</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exhibitions.map((exh) => (
          <div key={exh.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-5">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">{exh.title}</h2>
              <p className="text-gray-600 text-sm mb-3 truncate">{exh.description || 'No description.'}</p>
              <p className="text-xs text-gray-400">Created: {new Date(exh.created_at).toLocaleDateString()}</p>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleShowQrCode(exh)}
                className="px-3 py-1 text-xs font-medium text-white bg-purple-500 rounded hover:bg-purple-600"
              >
                Show QR
              </button>
              <Link
                to={`/admin/exhibitions/${exh.id}/stations`}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Manage Stations
              </Link>
              <button
                onClick={() => handleOpenModal(exh)}
                className="px-3 py-1 text-xs font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteExhibition(exh.id)}
                className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ExhibitionForm
          exhibition={editingExhibition}
          onSave={handleSaveExhibition}
          onCancel={handleCloseModal}
        />
      </Modal>

      <Modal isOpen={qrCodeModalOpen} onClose={() => setQrCodeModalOpen(false)}>
        <h3 className="text-xl font-semibold mb-2">QR Code for: {currentExhibitionTitle}</h3>
        {currentQrCode ? (
          <img src={currentQrCode} alt="Exhibition QR Code" className="mx-auto" />
        ) : (
          <p>Loading QR Code...</p>
        )}
         <p className="text-xs text-gray-500 mt-2">Scan this code to view the exhibition.</p>
      </Modal>
    </div>
  );
}

export default ExhibitionsPage;
