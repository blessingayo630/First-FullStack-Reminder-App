// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// interface Reminder {
//   id: number;
//   title: string;
//   description: string;
//   due_date: string;
//   remind_before: number;
//   remind_unit: string;
//   user_email: string;
//    phoneNumber: string | null;
//   is_sent: boolean;
// }

// export default function Home() {
//   const [reminders, setReminders] = useState<Reminder[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
//   const [showEditForm, setShowEditForm] = useState(false);
  
//   // Form state
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     dueDate: '',
//     remindBefore: 1,
//     remindUnit: 'days',
//     userEmail: '',
//     phoneNumber: ''
//   });

//   // Initial load effect - direct fetch, no callback needed
//   useEffect(() => {
//     const loadReminders = async () => {
//       setLoading(true);
//       try {
//     const response = await fetch('/api/reminders/getAll');
//     const data = await response.json();
//     if (Array.isArray(data)) {
//       setReminders(data);
//     } else {
//       console.error('Invalid data from API:', data);
//       setReminders([]);
//     }
//       } catch (error) {
//         console.error('Error fetching reminders:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadReminders();
//   }, []); // Empty deps: run once on mount

//   // Separate refetch for event handlers (stable)
//   const refetch = useCallback(async () => {
//     try {
//       const response = await fetch('/api/reminders/getAll');
//       const data = await response.json();
//       if (Array.isArray(data)) {
//         setReminders(data);
//       } else {
//         console.error('Invalid data from API:', data);
//         setReminders([]);
//       }
//     } catch (error) {
//       console.error('Error refetching reminders:', error);
//     }
//   }, []);

//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();
    
//   //   try {
//   //     const response = await fetch('/api/reminders/create', {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //      body: JSON.stringify({
//   //       ...formData,
//   //       dueDate: formData.dueDate, // Send the raw local string
//   //       phoneNumber: formData.phoneNumber || null
//   //     }),
//   //     });

//   //     if (response.ok) {
//   //       // Reset form and refresh list
//   //       resetForm();
//   //       setShowForm(false);
//   //       refetch();
//   //       toast.success('Reminder added successfully!');
//   //     } else {
//   //       const error = await response.json();
//   //       toast.error(`Error: ${error.error}`);
//   //     }
//   //   } catch (error) {
//   //     console.error('Error adding reminder:', error);
//   //     toast.error('Failed to add reminder');
//   //   }
//   // };

//  const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
  
//   try {
//     // Convert local datetime-local value to UTC ISO string
//     const localDate = new Date(formData.dueDate);
//     const utcDueDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString();
    
//     const response = await fetch('/api/reminders/create', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         ...formData,
//         dueDate: utcDueDate, // Send UTC to backend
//         phoneNumber: formData.phoneNumber || null
//       }),
//     });

//     if (response.ok) {
//       resetForm();
//       setShowForm(false);
//       refetch();
//       toast.success('Reminder added successfully!');
//     } else {
//       const error = await response.json();
//       toast.error(`Error: ${error.error}`);
//     }
//   } catch (error) {
//     console.error('Error adding reminder:', error);
//     toast.error('Failed to add reminder');
//   }
// };



//   // const handleEditClick = async (reminder: Reminder) => {
//   //   try {
//   //     // Fetch latest single reminder for accurate data
//   //     const response = await fetch(`/api/reminders?id=${reminder.id}`);
//   //     if (!response.ok) {
//   //       const errorText = await response.text();
//   //       throw new Error(`Failed to fetch reminder: ${response.status} ${errorText}`);
//   //     }
//   //     const latestReminder = await response.json();
      
//   //     setEditingReminder(latestReminder);
//   //     setFormData({
//   //       title: latestReminder.title,
//   //       description: latestReminder.description,
//   //       // Since we now treat DB as wall-clock UTC, just slice it
//   //       dueDate: latestReminder.due_date.slice(0, 16),
//   //       remindBefore: latestReminder.remind_before,
//   //       remindUnit: latestReminder.remind_unit,
//   //       userEmail: latestReminder.user_email,
//   //       phoneNumber: latestReminder.phoneNumber || ''
//   //     });
//   //     setShowEditForm(true);
//   //   } catch (error) {
//   //     console.error('Error loading reminder for edit:', error);
//   //     toast.error('Failed to load reminder');
//   //   }
//   // };

//   // const handleUpdateSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();
    
//   //   if (!editingReminder) return;

//   //   try {
//   //     const response = await fetch('/api/reminders/update', {
//   //       method: 'PUT',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify({
//   //         ...formData,
//   //         id: editingReminder.id,
//   //         dueDate: formData.dueDate // Send the raw local string
//   //       }),
//   //     });

//   //     if (response.ok) {
//   //       resetForm();
//   //       setEditingReminder(null);
//   //       setShowEditForm(false);
//   //       refetch();
//   //       toast.success('Reminder updated successfully!');
//   //     } else {
//   //       const error = await response.json();
//   //       toast.error(`Error: ${error.error}`);
//   //     }
//   //   } catch (error) {
//   //     console.error('Error updating reminder:', error);
//   //     toast.error('Failed to update reminder');
//   //   }
//   // };

// const handleEditClick = async (reminder: Reminder) => {
//   try {
//     const response = await fetch(`/api/reminders?id=${reminder.id}`);
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`Failed to fetch reminder: ${response.status} ${errorText}`);
//     }
//     const latestReminder = await response.json();
    
//     setEditingReminder(latestReminder);
    
//     // Convert UTC database time to local datetime-local format
//     const utcDate = new Date(latestReminder.due_date);
//     const localDateString = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000))
//       .toISOString()
//       .slice(0, 16);
    
//     setFormData({
//       title: latestReminder.title,
//       description: latestReminder.description,
//       dueDate: localDateString,
//       remindBefore: latestReminder.remind_before,
//       remindUnit: latestReminder.remind_unit,
//       userEmail: latestReminder.user_email,
//       phoneNumber: latestReminder.phoneNumber || ''
//     });
//     setShowEditForm(true);
//   } catch (error) {
//     console.error('Error loading reminder for edit:', error);
//     toast.error('Failed to load reminder');
//   }
// };
// const handleUpdateSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
  
//   if (!editingReminder) return;

//   try {
//     // Convert local datetime-local value to UTC ISO string
//     const localDate = new Date(formData.dueDate);
//     const utcDueDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString();
    
//     const response = await fetch('/api/reminders/update', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         ...formData,
//         id: editingReminder.id,
//         dueDate: utcDueDate // Send UTC to backend
//       }),
//     });

//     if (response.ok) {
//       resetForm();
//       setEditingReminder(null);
//       setShowEditForm(false);
//       refetch();
//       toast.success('Reminder updated successfully!');
//     } else {
//       const error = await response.json();
//       toast.error(`Error: ${error.error}`);
//     }
//   } catch (error) {
//     console.error('Error updating reminder:', error);
//     toast.error('Failed to update reminder');
//   }
// };

//   const resetForm = () => {
//     setFormData({
//       title: '',
//       description: '',
//       dueDate: '',
//       remindBefore: 1,
//       remindUnit: 'days',
//       userEmail: '',
//       phoneNumber: ''
//     });
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm('Are you sure you want to delete this reminder?')) return;
    
//     try {
//       const response = await fetch(`/api/reminders/delete?id=${id}`, {
//         method: 'DELETE',
//       });

//     if (response.ok) {
//       refetch();
//       toast.success('Reminder deleted successfully!');
//     } else {
//       toast.error('Failed to delete reminder');
//     }
//     } catch (error) {
//       console.error('Error deleting reminder:', error);
//       toast.error('Failed to delete reminder');
//     }
//   };

//   // const formatDate = (dateString: string) => {
//   //   return new Date(dateString).toLocaleString();
//   // };

//   const formatDate = (dateString: string) => {
//   // Parse the UTC date string from database
//   const utcDate = new Date(dateString);
  
//   // Check if date is valid
//   if (isNaN(utcDate.getTime())) {
//     return dateString;
//   }
  
//   // Convert UTC to local time for display
//   return utcDate.toLocaleString();
// };

//   const getReminderText = (reminder: Reminder) => {
//     return `Remind ${reminder.remind_before} ${reminder.remind_unit} before due date`;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-xl">Loading reminders...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 py-8">
//       <div className="max-w-4xl mx-auto px-4">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">⏰ Reminder App</h1>
//               <p className="text-gray-600 mt-2">Never miss important events or payments again</p>
//             </div>
//             <button
//               onClick={() => setShowForm(!showForm)}
//               className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
//             >
//               {showForm ? 'Cancel' : '+ Add Reminder'}
//             </button>
//           </div>
//         </div>

//         {/* Add Reminder Form */}
//         {showForm && (
//           <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//             <h2 className="text-xl font-semibold mb-4">Add New Reminder</h2>
//             <form onSubmit={handleSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Title *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={formData.title}
//                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                     placeholder="e.g., Pay electricity bill"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Your Email *
//                   </label>
//                   <input
//                     type="email"
//                     required
//                     className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={formData.userEmail}
//                     onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
//                     placeholder="you@example.com"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Due Date & Time *
//                   </label>
//                   <input
//                     type="datetime-local"
//                     required
//                     className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={formData.dueDate}
//                     onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Description (Optional)
//                   </label>
//                   <input
//                     type="text"
//                     className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     placeholder="Additional details"
//                   />
//                 </div>
                
//                  <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Phone Number (for SMS - optional)
//                 </label>
//                 <input 
//                   type="tel"
//                   className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                   placeholder="e.g., +1234567890 or 0712345678" 
//                   value={formData.phoneNumber} 
//                   onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
//                 />
//                 <p className="text-sm text-gray-500 mt-2">Include country code for SMS notifications</p>
//               </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Remind Me
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       type="number"
//                       min="1"
//                       required
//                       className="w-24 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       value={formData.remindBefore}
//                       onChange={(e) => setFormData({ ...formData, remindBefore: parseInt(e.target.value) })}
//                     />
//                     <select
//                       className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       value={formData.remindUnit}
//                       onChange={(e) => setFormData({ ...formData, remindUnit: e.target.value })}
//                     >
//                       <option value="minutes">Minutes Before</option>
//                       <option value="hours">Hours Before</option>
//                       <option value="days">Days Before</option>
//                       <option value="weeks">Weeks Before</option>
//                       <option value="months">Months Before</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 flex gap-3">
//                 <button
//                   type="submit"
//                   className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition"
//                 >
//                   Create Reminder
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     resetForm();
//                     setShowForm(false);
//                   }}
//                   className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* Edit Reminder Form */}
//         {showEditForm && editingReminder && (
//           <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//             <h2 className="text-xl font-semibold mb-4">Edit Reminder</h2>
//             <form onSubmit={handleUpdateSubmit}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Title *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={formData.title}
//                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Your Email *
//                   </label>
//                   <input
//                     type="email"
//                     required
//                     className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={formData.userEmail}
//                     onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Due Date & Time *
//                   </label>
//                   <input
//                     type="datetime-local"
//                     required
//                     className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={formData.dueDate}
//                     onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Description (Optional)
//                   </label>
//                   <input
//                     type="text"
//                     className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   />
//                 </div>

//                 <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Phone Number (for SMS - optional)
//                 </label>
//                 <input 
//                   type="tel"
//                   className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
//                   placeholder="e.g., +1234567890 or 0712345678" 
//                   value={formData.phoneNumber} 
//                   onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
//                 />
//                 <p className="text-sm text-gray-500 mt-2">Include country code for SMS notifications</p>
//               </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Remind Me
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       type="number"
//                       min="1"
//                       required
//                       className="w-24 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       value={formData.remindBefore}
//                       onChange={(e) => setFormData({ ...formData, remindBefore: parseInt(e.target.value) })}
//                     />
//                     <select
//                       className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       value={formData.remindUnit}
//                       onChange={(e) => setFormData({ ...formData, remindUnit: e.target.value })}
//                     >
//                       <option value="minutes">Minutes Before</option>
//                       <option value="hours">Hours Before</option>
//                       <option value="days">Days Before</option>
//                       <option value="weeks">Weeks Before</option>
//                       <option value="months">Months Before</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 flex gap-3">
//                 <button
//                   type="submit"
//                   className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
//                 >
//                   Update Reminder
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     resetForm();
//                     setEditingReminder(null);
//                     setShowEditForm(false);
//                   }}
//                   className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* Reminders List */}
//         <div className="bg-white rounded-lg shadow-sm">
//           <div className="p-6 border-b">
//             <h2 className="text-xl font-semibold">Your Reminders</h2>
//             <p className="text-gray-600 text-sm mt-1">
//               {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} total
//             </p>
//           </div>

//           {reminders.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">
//               <p className="text-lg">No reminders yet</p>
//               <p className="text-sm mt-2">Click the &quot;Add Reminder&quot; button to create one</p>
//             </div>
//           ) : (
//             <div className="divide-y">
//               {(Array.isArray(reminders) ? reminders : []).map((reminder) => (
//                 <div key={reminder.id} className="p-6 hover:bg-gray-50 transition">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <div className="flex justify-between items-start mb-2">
//                         <h3 className="text-lg font-semibold text-gray-800">
//                           {reminder.title}
//                         </h3>
//                         <span className={`text-xs px-2 py-1 rounded-full ${
//                           reminder.is_sent 
//                             ? 'bg-gray-200 text-gray-600' 
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {reminder.is_sent ? 'Sent' : 'Pending'}
//                         </span>
//                       </div>
                      
//                       {reminder.description && (
//                         <p className="text-gray-600 mb-2">{reminder.description}</p>
//                       )}
                      
//                       <div className="flex flex-wrap gap-4 text-sm">
//                         <span className="text-gray-500">
//                           📅 Due: {formatDate(reminder.due_date)}
//                         </span>
//                         <span className="text-blue-600">
//                           ⏰ {getReminderText(reminder)}
//                         </span>
//                         <span className="text-gray-500">
//                           📧 {reminder.user_email}
//                         </span>
//                       </div>
//                     </div>
                    
//                     <div className="flex gap-2 ml-4">
//                       <button
//                         onClick={() => handleEditClick(reminder)}
//                         className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition"
//                         title="Edit reminder"
//                       >
//                         ✏️ Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(reminder.id)}
//                         className="text-red-500 hover:text-red-700 px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition"
//                         title="Delete reminder"
//                       >
//                         🗑️ Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Reminder {
  id: number;
  title: string;
  description: string;
  due_date: string;
  remind_before: number;
  remind_unit: string;
  user_email: string;
  phoneNumber: string | null;
  is_sent: boolean;
}

export default function Home() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    remindBefore: 1,
    remindUnit: 'days',
    userEmail: '',
    phoneNumber: ''
  });

  // Initial load effect - direct fetch, no callback needed
  useEffect(() => {
    const loadReminders = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/reminders/getAll');
        const data = await response.json();
        if (Array.isArray(data)) {
          setReminders(data);
        } else {
          console.error('Invalid data from API:', data);
          setReminders([]);
        }
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
  }, []);

  // Separate refetch for event handlers (stable)
  const refetch = useCallback(async () => {
    try {
      const response = await fetch('/api/reminders/getAll');
      const data = await response.json();
      if (Array.isArray(data)) {
        setReminders(data);
      } else {
        console.error('Invalid data from API:', data);
        setReminders([]);
      }
    } catch (error) {
      console.error('Error refetching reminders:', error);
    }
  }, []);

  // Simple submit - send the local datetime string as-is
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/reminders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate, // Send the raw local string
          phoneNumber: formData.phoneNumber || null
        }),
      });

      if (response.ok) {
        resetForm();
        setShowForm(false);
        refetch();
        toast.success('Reminder added successfully!');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast.error('Failed to add reminder');
    }
  };

  // For editing: just use the due_date as-is from the database
  const handleEditClick = async (reminder: Reminder) => {
    try {
      const response = await fetch(`/api/reminders?id=${reminder.id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch reminder: ${response.status} ${errorText}`);
      }
      const latestReminder = await response.json();
      
      setEditingReminder(latestReminder);
      
      // Simply slice the UTC string to get YYYY-MM-DDThh:mm format
      // The backend handles UTC conversion, we just display what's stored
      setFormData({
        title: latestReminder.title,
        description: latestReminder.description,
        dueDate: latestReminder.due_date.slice(0, 16),
        remindBefore: latestReminder.remind_before,
        remindUnit: latestReminder.remind_unit,
        userEmail: latestReminder.user_email,
        phoneNumber: latestReminder.phoneNumber || ''
      });
      setShowEditForm(true);
    } catch (error) {
      console.error('Error loading reminder for edit:', error);
      toast.error('Failed to load reminder');
    }
  };

  // Simple update - send the local datetime string as-is
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingReminder) return;

    try {
      const response = await fetch('/api/reminders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: editingReminder.id,
          dueDate: formData.dueDate // Send the raw local string
        }),
      });

      if (response.ok) {
        resetForm();
        setEditingReminder(null);
        setShowEditForm(false);
        refetch();
        toast.success('Reminder updated successfully!');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      remindBefore: 1,
      remindUnit: 'days',
      userEmail: '',
      phoneNumber: ''
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    
    try {
      const response = await fetch(`/api/reminders/delete?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        refetch();
        toast.success('Reminder deleted successfully!');
      } else {
        toast.error('Failed to delete reminder');
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    }
  };

  const formatDate = (dateString: string) => {
    const utcDate = new Date(dateString);
    if (isNaN(utcDate.getTime())) {
      return dateString;
    }
    return utcDate.toLocaleString();
  };

  const getReminderText = (reminder: Reminder) => {
    return `Remind ${reminder.remind_before} ${reminder.remind_unit} before due date`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading reminders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">⏰ Reminder App</h1>
              <p className="text-gray-600 mt-2">Never miss important events or payments again</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
            >
              {showForm ? 'Cancel' : '+ Add Reminder'}
            </button>
          </div>
        </div>

        {/* Add Reminder Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Reminder</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Pay electricity bill"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (for SMS - optional)
                  </label>
                  <input 
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g., +1234567890 or 0712345678" 
                    value={formData.phoneNumber} 
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                  />
                  <p className="text-sm text-gray-500 mt-2">Include country code for SMS notifications</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remind Me
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-24 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.remindBefore}
                      onChange={(e) => setFormData({ ...formData, remindBefore: parseInt(e.target.value) })}
                    />
                    <select
                      className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.remindUnit}
                      onChange={(e) => setFormData({ ...formData, remindUnit: e.target.value })}
                    >
                      <option value="minutes">Minutes Before</option>
                      <option value="hours">Hours Before</option>
                      <option value="days">Days Before</option>
                      <option value="weeks">Weeks Before</option>
                      <option value="months">Months Before</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition"
                >
                  Create Reminder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Reminder Form */}
        {showEditForm && editingReminder && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Edit Reminder</h2>
            <form onSubmit={handleUpdateSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (for SMS - optional)
                  </label>
                  <input 
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g., +1234567890 or 0712345678" 
                    value={formData.phoneNumber} 
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                  />
                  <p className="text-sm text-gray-500 mt-2">Include country code for SMS notifications</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remind Me
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-24 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.remindBefore}
                      onChange={(e) => setFormData({ ...formData, remindBefore: parseInt(e.target.value) })}
                    />
                    <select
                      className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.remindUnit}
                      onChange={(e) => setFormData({ ...formData, remindUnit: e.target.value })}
                    >
                      <option value="minutes">Minutes Before</option>
                      <option value="hours">Hours Before</option>
                      <option value="days">Days Before</option>
                      <option value="weeks">Weeks Before</option>
                      <option value="months">Months Before</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
                >
                  Update Reminder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setEditingReminder(null);
                    setShowEditForm(false);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reminders List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Your Reminders</h2>
            <p className="text-gray-600 text-sm mt-1">
              {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} total
            </p>
          </div>

          {reminders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No reminders yet</p>
              <p className="text-sm mt-2">Click the &quot;Add Reminder&quot; button to create one</p>
            </div>
          ) : (
            <div className="divide-y">
              {(Array.isArray(reminders) ? reminders : []).map((reminder) => (
                <div key={reminder.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {reminder.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          reminder.is_sent 
                            ? 'bg-gray-200 text-gray-600' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reminder.is_sent ? 'Sent' : 'Pending'}
                        </span>
                      </div>
                      
                      {reminder.description && (
                        <p className="text-gray-600 mb-2">{reminder.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-500">
                          📅 Due: {formatDate(reminder.due_date)}
                        </span>
                        <span className="text-blue-600">
                          ⏰ {getReminderText(reminder)}
                        </span>
                        <span className="text-gray-500">
                          📧 {reminder.user_email}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditClick(reminder)}
                        className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition"
                        title="Edit reminder"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reminder.id)}
                        className="text-red-500 hover:text-red-700 px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition"
                        title="Delete reminder"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}