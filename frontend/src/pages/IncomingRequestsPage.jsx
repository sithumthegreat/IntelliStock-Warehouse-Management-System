import React, { useState } from 'react';
import { useRole } from '../context/RoleContext';

export default function IncomingRequestsPage() {
  const { currentRole, ROLES } = useRole();
  const isManager = currentRole === ROLES.MANAGER;
  const isRequester = currentRole === ROLES.REQUESTER;

  // 1. Table Data State (Now includes individual 'step' tracking)
  const [requests, setRequests] = useState([
    { id: 'REQ-0285', outlet: 'Colombo 03 Retail Outlet', product: 'Premium Arabica Coffee', qty: 50, priority: 'Normal', status: 'Approved', step: 2 },
    { id: 'REQ-0281', outlet: 'Colombo 03 Retail Outlet', product: 'Organic Green Tea', qty: 80, priority: 'High', status: 'Pending', step: 1 },
    { id: 'REQ-0280', outlet: 'Nugegoda Retail Outlet', product: 'Almond Milk 1L', qty: 50, priority: 'Normal', status: 'Pending', step: 1 },
    { id: 'REQ-0279', outlet: 'Kandy Retail Outlet', product: 'Premium Arabica Coffee', qty: 120, priority: 'Normal', status: 'Completed', step: 4 },
  ]);

  // 2. Track which request is currently selected to show in the workflow viewer
  const [selectedRequestId, setSelectedRequestId] = useState('REQ-0285');

  // 3. Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ product: 'Premium Arabica Coffee', qty: 10, priority: 'Normal' });

  // Form Submission Handler
  const handleCreateRequest = (e) => {
    e.preventDefault();
    const newRequest = {
      id: `REQ-028${requests.length + 2}`,
      outlet: 'Colombo 03 Retail Outlet',
      product: formData.product,
      qty: parseInt(formData.qty),
      priority: formData.priority,
      status: 'Pending',
      step: 1 // Starts at step 1: Submitted
    };
    
    setRequests([newRequest, ...requests]);
    setIsModalOpen(false);
    setSelectedRequestId(newRequest.id); // Automatically view the new request
  };

  // Manager Action Handler (Approving/Rejecting)
  const handleManagerAction = (e, id, newStatus) => {
    e.stopPropagation(); // Prevents row click from firing when clicking the button
    setRequests(requests.map(req => {
      if (req.id === id) {
        return { 
          ...req, 
          status: newStatus, 
          step: newStatus === 'Approved' ? 2 : req.step 
        };
      }
      return req;
    }));
    setSelectedRequestId(id); // Focus the tracker on the item just interacted with
  };

  // Workflow Progress Handler (Dispatching & Completing)
  const advanceWorkflow = (id, newStep, newStatus = null) => {
    setRequests(requests.map(req => {
      if (req.id === id) {
        return { 
          ...req, 
          step: newStep, 
          ...(newStatus && { status: newStatus }) // Update status if provided (e.g., to 'Completed')
        };
      }
      return req;
    }));
  };

  const getStatusStyle = (status) => {
    if (status === 'Approved') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Completed') return 'bg-blue-100 text-blue-700';
    if (status === 'Pending') return 'bg-amber-100 text-amber-700';
    if (status === 'Rejected') return 'bg-rose-100 text-rose-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Get the actively selected request for the workflow visualizer
  const activeRequest = requests.find(r => r.id === selectedRequestId) || requests[0];

  return (
    <div className="w-full px-6 md:px-10 py-6 max-w-7xl mx-auto relative">
      
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saturday, 17 October 2026</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase">Demo Environment</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">Incoming Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isManager ? 'Review stock requests from retail outlets.' : 'Submit and track your outlet stock requests.'}
          </p>
        </div>

        {isRequester && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            New request
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total requests</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{requests.length}</h3>
          <p className="text-xs mt-1 font-medium text-emerald-600">This demo</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Awaiting approval</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {requests.filter(r => r.status === 'Pending').length}
          </h3>
          <p className="text-xs mt-1 font-medium text-amber-600">Needs review</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Approved</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {requests.filter(r => r.status === 'Approved').length}
          </h3>
          <p className="text-xs mt-1 font-medium text-emerald-600">Ready for fulfilment</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Retail stock requests</h3>
            <p className="text-xs text-slate-500">Click any row to track its progress below.</p>
          </div>
          
          {isRequester && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              New request
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse cursor-pointer">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-gray-200">
                <th className="p-4">Request ID</th>
                <th className="p-4">Outlet</th>
                <th className="p-4">Product</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {requests.map((req) => (
                <tr 
                  key={req.id} 
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`transition-colors ${selectedRequestId === req.id ? 'bg-blue-50/60' : 'hover:bg-gray-50/50'}`}
                >
                  <td className="p-4 font-bold text-blue-700">{req.id}</td>
                  <td className="p-4 text-slate-600">{req.outlet}</td>
                  <td className="p-4 text-slate-500">{req.product}</td>
                  <td className="p-4 text-slate-700">{req.qty}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${req.priority === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold ${getStatusStyle(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {isManager && req.status === 'Pending' ? (
                      <div className="flex space-x-2">
                        <button onClick={(e) => handleManagerAction(e, req.id, 'Approved')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold shadow-sm">Approve</button>
                        <button onClick={(e) => handleManagerAction(e, req.id, 'Rejected')} className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded text-xs font-semibold">Reject</button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium">
                        {req.status === 'Pending' ? 'Awaiting Approval' : 'View Tracking ↓'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REQUEST WORKFLOW SECTION (Tied to the selected row) --- */}
      {activeRequest && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm mb-8 p-6 ring-1 ring-blue-50">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Tracking: <span className="text-blue-600">{activeRequest.id}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeRequest.product} ({activeRequest.qty} units) • {activeRequest.outlet}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-md text-xs uppercase font-bold ${getStatusStyle(activeRequest.status)}`}>
              Current Status: {activeRequest.status}
            </span>
          </div>

          {/* Visual Progress Tracker */}
          <div className="flex justify-between items-center relative max-w-4xl mx-auto px-8 mb-10">
            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 -z-10"></div>
            
            {/* Dynamic progress line based on activeRequest.step */}
            <div 
              className="absolute left-10 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 -z-10 transition-all duration-500 ease-in-out" 
              style={{ width: `${((activeRequest.step - 1) / 3) * 80}%` }}
            ></div>

            {['Submitted', 'Manager Approved', 'Dispatched', 'Goods Received'].map((stepName, index) => {
              const stepNum = index + 1;
              const isActive = activeRequest.step >= stepNum;
              return (
                <div key={stepName} className="flex flex-col items-center bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-600'}`}>
                    {stepNum}
                  </div>
                  <span className={`text-xs font-bold mt-3 ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                    {stepName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Role-Based Interactive Controls specific to the selected request */}
          <div className="flex justify-center border-t border-gray-100 pt-6">
            
            {/* Step 1: Pending Manager Approval */}
            {activeRequest.step === 1 && (
              <span className="text-xs text-amber-700 font-bold bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                {isManager ? 'Please approve or reject this request in the table above.' : 'Awaiting Warehouse Manager review...'}
              </span>
            )}

            {/* Step 2: Approved, Manager needs to Dispatch */}
            {activeRequest.step === 2 && isManager && (
              <button 
                onClick={() => advanceWorkflow(activeRequest.id, 3)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                Mark as Dispatched
              </button>
            )}
            {activeRequest.step === 2 && isRequester && (
              <span className="text-xs text-blue-700 font-bold bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                Approved! Awaiting dispatch from Central Warehouse...
              </span>
            )}

            {/* Step 3: Dispatched, Requester needs to Confirm Receipt */}
            {activeRequest.step === 3 && isRequester && (
              <button 
                onClick={() => advanceWorkflow(activeRequest.id, 4, 'Completed')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                Confirm Goods Received
              </button>
            )}
            {activeRequest.step === 3 && isManager && (
              <span className="text-xs text-amber-700 font-bold bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                Dispatched. Awaiting Requesting Entity to confirm receipt...
              </span>
            )}

            {/* Step 4: Completed */}
            {activeRequest.step === 4 && (
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                ✓ Order Completed & Goods Received
              </span>
            )}

            {/* Handle Rejected state */}
            {activeRequest.status === 'Rejected' && (
              <span className="text-xs text-rose-700 font-bold bg-rose-50 px-4 py-2 rounded-lg border border-rose-200">
                This request was rejected by the Warehouse Manager.
              </span>
            )}
          </div>
        </div>
      )}

      {/* NEW REQUEST MODAL (Unchanged) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Create Stock Request</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product</label>
                <select 
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Premium Arabica Coffee</option>
                  <option>Organic Green Tea</option>
                  <option>Almond Milk 1L</option>
                  <option>Dark Chocolate 70%</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity Requested</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.qty}
                  onChange={(e) => setFormData({...formData, qty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority Level</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Normal</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-gray-300 text-slate-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}