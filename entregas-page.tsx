import React, { useState } from 'react';
import { Home, Box, Search, MoreVertical, Plus } from 'lucide-react';

// Status badge component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    "Entregue": "bg-green-100 text-green-800",
    "Pendente": "bg-yellow-100 text-yellow-800",
    "Em Trânsito": "bg-purple-100 text-purple-800"
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
};

// Status change menu component
const StatusMenu = ({ isOpen, onClose, onStatusChange }) => {
  if (!isOpen) return null;
  
  const statusOptions = ["Entregue", "Pendente", "Em Trânsito"];
  
  return (
    <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="py-1">
        <div className="px-4 py-2 text-sm text-gray-700 font-medium">Alterar Status</div>
        {statusOptions.map((status) => (
          <button
            key={status}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              onStatusChange(status);
              onClose();
            }}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
};

const EntregasPage = () => {
  // Sample delivery data based on your image
  const [entregas, setEntregas] = useState([
    {
      id: "INB462453",
      cliente: {
        nome: "Jupt",
        telefone: "75 98441 349"
      },
      status: "Entregue",
      data: "19/03/2025",
      endereco: "Rua dos jesuítas, 44"
    },
    {
      id: "INB123456",
      cliente: {
        nome: "João Silva",
        telefone: "(11) 98765-4321"
      },
      status: "Pendente",
      data: "19/03/2025",
      endereco: "Avenida Principal, 456"
    },
    {
      id: "INB123457",
      cliente: {
        nome: "Maria Santos",
        telefone: "(11) 91234-5678"
      },
      status: "Em Trânsito",
      data: "19/03/2025",
      endereco: "Rua Residencial, 321"
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Filter deliveries based on search term
  const filteredEntregas = entregas.filter(entrega => 
    entrega.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entrega.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entrega.cliente.telefone.includes(searchTerm)
  );
  
  // Handle status change
  const handleStatusChange = (id, newStatus) => {
    setEntregas(entregas.map(entrega => 
      entrega.id === id ? {...entrega, status: newStatus} : entrega
    ));
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-56 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="mr-2 text-blue-600">
              <Box size={20} />
            </div>
            <h1 className="text-lg font-semibold">Inbox Entregas</h1>
          </div>
        </div>
        
        <div className="p-2">
          <h2 className="px-4 py-2 text-sm font-medium text-gray-600">Menu</h2>
          
          <a href="/dashboard" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
            <Home size={18} className="mr-3" />
            Dashboard
          </a>
          
          <a href="/entregas" className="flex items-center px-4 py-3 text-sm text-gray-700 bg-gray-100 rounded-md mt-1">
            <Box size={18} className="mr-3" />
            Entregas
          </a>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Entregas</h1>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
              <Plus size={16} className="mr-2" />
              Nova Entrega
            </button>
          </div>
          
          {/* Search bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar por cliente ou número de rastreamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rastreamento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endereço de Entrega
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntregas.map((entrega) => (
                  <tr key={entrega.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entrega.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entrega.cliente.nome}</div>
                      <div className="text-sm text-gray-500">{entrega.cliente.telefone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={entrega.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entrega.data}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entrega.endereco}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => setOpenMenuId(openMenuId === entrega.id ? null : entrega.id)}
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      <StatusMenu 
                        isOpen={openMenuId === entrega.id}
                        onClose={() => setOpenMenuId(null)}
                        onStatusChange={(status) => handleStatusChange(entrega.id, status)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredEntregas.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                Nenhuma entrega encontrada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntregasPage;
