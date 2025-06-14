import React, { useEffect, useState } from 'react';
import { Plus, Search, FileText, User, Calendar } from 'lucide-react';
import { supabase, Database } from '../../lib/supabase';
import { MedicalRecordForm } from './MedicalRecordForm';

type MedicalRecord = Database['public']['Tables']['medical_records']['Row'] & {
  patients?: {
    first_name: string;
    last_name: string;
  };
};

export function MedicalRecordsList() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    const filtered = records.filter(record =>
      `${record.patients?.first_name} ${record.patients?.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
  }, [records, searchTerm]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patients (first_name, last_name)
        `)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    fetchRecords();
  };

  if (showForm) {
    return (
      <MedicalRecordForm
        onSubmit={handleFormSubmit}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-gray-600">View and manage patient medical records</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Record
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search records by patient name, diagnosis, or doctor..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No medical records found</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-600">
                      <User className="h-5 w-5 mr-2" />
                      <span className="font-medium">
                        {record.patients?.first_name} {record.patients?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>{new Date(record.visit_date).toLocaleDateString()}</span>
                    </div>
                    {record.doctor_name && (
                      <div className="text-gray-600">
                        <span className="font-medium">Dr. {record.doctor_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {record.diagnosis && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Diagnosis</h3>
                      <p className="text-gray-600 text-sm">{record.diagnosis}</p>
                    </div>
                  )}

                  {record.treatment && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Treatment</h3>
                      <p className="text-gray-600 text-sm">{record.treatment}</p>
                    </div>
                  )}

                  {record.prescription && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Prescription</h3>
                      <p className="text-gray-600 text-sm">{record.prescription}</p>
                    </div>
                  )}

                  {record.notes && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                      <p className="text-gray-600 text-sm">{record.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}