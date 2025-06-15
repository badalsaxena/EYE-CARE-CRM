import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { supabase, Database } from '../../lib/supabase';
import { PatientForm } from './PatientForm';
import { PatientDetails } from './PatientDetails';

type Patient = Database['public']['Tables']['patients']['Row'];

export function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter((patient) =>
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this patient? This will also delete all their appointments and medical records.'
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('patients').delete().eq('id', patientId);
      if (error) throw error;
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setSelectedPatient(null);
    setIsEditing(false);
    fetchPatients();
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetails(true);
  };

  if (showForm) {
    return (
      <PatientForm
        patient={isEditing ? selectedPatient : null}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setSelectedPatient(null);
          setIsEditing(false);
        }}
      />
    );
  }

  if (showDetails && selectedPatient) {
    return (
      <PatientDetails
        patient={selectedPatient}
        onBack={() => {
          setShowDetails(false);
          setSelectedPatient(null);
        }}
        onEdit={() => {
          setShowDetails(false);
          handleEditPatient(selectedPatient);
        }}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600">Manage your clinic's patient database</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Patient
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Patient Table or Loader */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg" />
          ))}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No patients found</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6">Name</th>
                <th className="text-left py-3 px-6">Email</th>
                <th className="text-left py-3 px-6">Phone</th>
                <th className="text-left py-3 px-6">Date of Birth</th>
                <th className="text-left py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {patient.first_name} {patient.last_name}
                  </td>
                  <td className="py-4 px-6 text-gray-600">{patient.email || '-'}</td>
                  <td className="py-4 px-6 text-gray-600">{patient.phone || '-'}</td>
                  <td className="py-4 px-6 text-gray-600">
                    {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditPatient(patient)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit Patient"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Patient"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
